export const APP_TIME_ZONE = "America/Sao_Paulo";

export function greetingForHour(hour: number) {
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
}

export function formatLongDate(value: Date) {
  const formatted = new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: APP_TIME_ZONE,
  }).format(value);
  return formatted.replace(/\p{L}+/gu, (word) => word[0].toUpperCase() + word.slice(1));
}

export function formatCurrency(value: number | string) {
  const num = typeof value === "string" ? Number(value) : value;
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(num);
}

export function formatDate(value: Date | string) {
  const date = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: APP_TIME_ZONE,
  }).format(date);
}

export function formatDateTime(value: Date | string) {
  const date = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: APP_TIME_ZONE,
  }).format(date);
}

export function formatTime(value: Date | string) {
  const date = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: APP_TIME_ZONE,
  }).format(date);
}

/** Converte um Date (instante UTC) para o valor de string que um <input type="datetime-local">
 * espera, representando o horário local de São Paulo (não o fuso do servidor/navegador). */
export function toDateTimeLocalValue(value: Date | string) {
  const date = typeof value === "string" ? new Date(value) : value;
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: APP_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "00";
  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}`;
}

/** Converte o valor de um <input type="datetime-local"> (string sem fuso, ex: "2026-07-16T09:00"),
 * interpretado como horário de São Paulo, para o instante UTC correto (ISO string). */
export function fromDateTimeLocalValue(value: string) {
  const [datePart, timePart] = value.split("T");
  const [year, month, day] = datePart.split("-").map(Number);
  const [hour, minute] = timePart.split(":").map(Number);

  // Descobre o offset de São Paulo (em minutos) para esse instante aproximado usando UTC como palpite inicial.
  const utcGuess = new Date(Date.UTC(year, month - 1, day, hour, minute));
  const offsetMinutes = getTimeZoneOffsetMinutes(utcGuess, APP_TIME_ZONE);
  const utcMillis = Date.UTC(year, month - 1, day, hour, minute) - offsetMinutes * 60 * 1000;
  return new Date(utcMillis).toISOString();
}

function getTimeZoneOffsetMinutes(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? 0);
  const asUTC = Date.UTC(
    get("year"),
    get("month") - 1,
    get("day"),
    get("hour"),
    get("minute"),
    get("second")
  );
  return (asUTC - date.getTime()) / 60000;
}

/** Extrai hora/dia/mês/ano no fuso de São Paulo, independente do fuso do processo (servidor/navegador). */
export function getDatePartsInAppTimeZone(date: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: APP_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? 0);
  return { year: get("year"), month: get("month"), day: get("day"), hour: get("hour") };
}

export function getHourInAppTimeZone(date: Date) {
  return getDatePartsInAppTimeZone(date).hour;
}

export function formatDayKeyInAppTimeZone(date: Date) {
  const { day, month } = getDatePartsInAppTimeZone(date);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(day)}/${pad(month)}`;
}

/** Limites do mês (início inclusivo, fim exclusivo) considerando o calendário de São Paulo,
 * não o fuso do servidor. */
export function monthBoundsInAppTimeZone(reference: Date) {
  const { year, month, day: today } = getDatePartsInAppTimeZone(reference);
  const pad = (n: number) => String(n).padStart(2, "0");

  const start = new Date(fromDateTimeLocalValue(`${year}-${pad(month)}-01T00:00`));
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;
  const end = new Date(fromDateTimeLocalValue(`${nextYear}-${pad(nextMonth)}-01T00:00`));
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();

  return { start, end, year, month, daysInMonth, today };
}

/** Converte uma string "YYYY-MM-DD" (dia no fuso de São Paulo) para o instante UTC de início desse dia. */
export function dayStartInAppTimeZone(dateStr: string) {
  return new Date(fromDateTimeLocalValue(`${dateStr}T00:00`));
}

/** Instante UTC exclusivo de fim de um dia "YYYY-MM-DD" no fuso de São Paulo (início do dia seguinte). */
export function dayEndExclusiveInAppTimeZone(dateStr: string) {
  return new Date(dayStartInAppTimeZone(dateStr).getTime() + 24 * 60 * 60 * 1000);
}

export function daysSince(value: Date | string) {
  const date = typeof value === "string" ? new Date(value) : value;
  const diffMs = Date.now() - date.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

export function relativeDaysLabel(days: number) {
  if (days <= 0) return "hoje";
  if (days === 1) return "há 1 dia";
  if (days < 30) return `há ${days} dias`;
  const months = Math.floor(days / 30);
  if (months === 1) return "há 1 mês";
  if (months < 12) return `há ${months} meses`;
  const years = Math.floor(months / 12);
  return years === 1 ? "há 1 ano" : `há ${years} anos`;
}

export const CYLINDER_TIER_LABELS: Record<string, string> = {
  BAIXA: "Baixa",
  MEDIA: "Média",
  ALTA: "Alta",
};

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  DEBITO: "Cartão de Débito",
  CREDITO: "Cartão de Crédito",
  PIX: "Pix",
};

export const WORK_ORDER_STATUS_LABELS: Record<string, string> = {
  AGENDADO: "Agendado",
  EM_ANDAMENTO: "Em andamento",
  CONCLUIDO: "Concluído",
  CANCELADO: "Cancelado",
};

export const REFERRAL_SOURCE_LABELS: Record<string, string> = {
  INSTAGRAM: "Instagram",
  INDICACAO: "Indicação",
  CARTAO_VISITA: "Cartão de visita",
  FACHADA: "Fachada",
};
