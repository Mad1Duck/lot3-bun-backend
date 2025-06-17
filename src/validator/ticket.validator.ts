import { z } from "zod";

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

export const ticketSchema = z.object({
  ticketNumber: z.string().min(1, "Ticket number is required."),
  startDate: z
    .string()
    .regex(dateRegex, "Start date must be in YYYY-MM-DD format."),
  endDate: z
    .string()
    .regex(dateRegex, "End date must be in YYYY-MM-DD format."),
  template: z.enum(["template", "template1", "template2"]),
  eventName: z.string().min(1, "Event name is required."),
});

export type TicketSchemaType = z.infer<typeof ticketSchema>;
