import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
import { MotoboySession, Delivery } from './types'; // Ajuste conforme seus tipos

export function calculateMotoboyPayment(session: MotoboySession, deliveries: Delivery[]): number {
  // Calcula a duração da sessão em horas
  const startTime = new Date(session.start_time);
  const endTime = session.end_time ? new Date(session.end_time) : new Date();
  const durationHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);

  // Contagem de entregas no Jardim Paraíso e em outros bairros
  const jardimParaisoDeliveries = deliveries.filter(d => d.bairro.toLowerCase() === 'jardim paraíso').length;
  const otherDeliveries = deliveries.length - jardimParaisoDeliveries;
  const totalDeliveries = deliveries.length;

  let payment = 0;

  // Caso 1: Sessão de até 6 horas
  if (durationHours <= 6) {
    // Base: 10 entregas no Jardim Paraíso = R$90,00
    if (totalDeliveries <= 10 && jardimParaisoDeliveries === totalDeliveries) {
      payment = 90;
    } else {
      // Paga R$90,00 pelas primeiras 10 entregas no Jardim Paraíso (ou menos)
      payment = Math.min(jardimParaisoDeliveries, 10) * 9; // R$9,00 por entrega (90 / 10)
      // Entregas adicionais (acima de 10)
      if (totalDeliveries > 10) {
        const extraDeliveries = totalDeliveries - 10;
        const extraJardimParaiso = Math.max(0, jardimParaisoDeliveries - 10);
        const extraOthers = extraDeliveries - extraJardimParaiso;
        payment += extraJardimParaiso * 6; // R$6,00 por entrega extra no Jardim Paraíso
        payment += extraOthers * 9; // R$9,00 por entrega extra em outros bairros
      }
      // Se houver entregas fora do Jardim Paraíso, ajusta para R$9,00 cada
      if (otherDeliveries > 0) {
        payment += otherDeliveries * 9;
        payment -= Math.min(otherDeliveries, 10) * 9; // Remove o valor base incorreto
        payment += Math.min(otherDeliveries, 10) * 9; // Re-adiciona como R$9,00
      }
    }
  } else {
    // Caso 2: Sessão acima de 6 horas (ex.: 18h às 2h)
    // Base: R$110,00 para 10 entregas
    if (totalDeliveries <= 10) {
      payment = 110;
    } else {
      payment = 110; // Base para as 10 primeiras entregas
      // Entregas adicionais
      const extraDeliveries = totalDeliveries - 10;
      const extraJardimParaiso = jardimParaisoDeliveries > 10 ? jardimParaisoDeliveries - 10 : 0;
      const extraOthers = extraDeliveries - extraJardimParaiso;
      payment += extraJardimParaiso * 6; // R$6,00 por entrega extra no Jardim Paraíso
      payment += extraOthers * 9; // R$9,00 por entrega extra em outros bairros
    }
  }

  return parseFloat(payment.toFixed(2));
}