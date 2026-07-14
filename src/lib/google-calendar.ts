import "server-only";
import { google } from "googleapis";

const TIME_ZONE = "America/Sao_Paulo";

function getCalendarClient() {
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  const calendarId = process.env.GOOGLE_CALENDAR_ID;

  if (!clientEmail || !privateKey || !calendarId) {
    return null;
  }

  const auth = new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/calendar"],
  });

  return { calendar: google.calendar({ version: "v3", auth }), calendarId };
}

export type WorkOrderCalendarEvent = {
  googleEventId?: string | null;
  summary: string;
  description: string;
  start: Date;
  durationMinutes: number;
};

/**
 * Cria ou atualiza o evento correspondente a uma OS no Google Calendar.
 * Retorna o id do evento, ou null se a integração não estiver configurada
 * ou a chamada falhar (nunca lança - a sincronização é best-effort e não
 * pode travar o fluxo principal da OS).
 */
export async function upsertWorkOrderCalendarEvent(
  input: WorkOrderCalendarEvent
): Promise<string | null> {
  const client = getCalendarClient();
  if (!client) return null;

  const end = new Date(input.start.getTime() + input.durationMinutes * 60 * 1000);
  const requestBody = {
    summary: input.summary,
    description: input.description,
    start: { dateTime: input.start.toISOString(), timeZone: TIME_ZONE },
    end: { dateTime: end.toISOString(), timeZone: TIME_ZONE },
  };

  try {
    if (input.googleEventId) {
      const res = await client.calendar.events.update({
        calendarId: client.calendarId,
        eventId: input.googleEventId,
        requestBody,
      });
      return res.data.id ?? null;
    }

    const res = await client.calendar.events.insert({
      calendarId: client.calendarId,
      requestBody,
    });
    return res.data.id ?? null;
  } catch (error) {
    // Evento pode ter sido apagado manualmente na Google Agenda - tenta recriar.
    if (input.googleEventId) {
      try {
        const res = await client.calendar.events.insert({
          calendarId: client.calendarId,
          requestBody,
        });
        return res.data.id ?? null;
      } catch (retryError) {
        console.error("Falha ao sincronizar OS com o Google Calendar:", retryError);
        return null;
      }
    }
    console.error("Falha ao sincronizar OS com o Google Calendar:", error);
    return null;
  }
}

export async function deleteWorkOrderCalendarEvent(googleEventId: string): Promise<void> {
  const client = getCalendarClient();
  if (!client) return;

  try {
    await client.calendar.events.delete({
      calendarId: client.calendarId,
      eventId: googleEventId,
    });
  } catch (error) {
    // Já pode ter sido removido manualmente - não é um erro fatal.
    console.error("Falha ao remover evento do Google Calendar:", error);
  }
}
