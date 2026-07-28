import * as habitsService from './habits.service.js';
import * as trackingService from './tracking.service.js';

export const getStatsForUser = async (userId) => {
  // Logik für Statistiken hier implementieren

  // Beispiel: Abrufen aller Einträge für den letzten Monat
  const today = new Date();
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(today.getDate() - 30);

  // Formatierung als YYYY-MM-DD String, passend zum Prisma-Schema
  const fromDate = thirtyDaysAgo.toISOString().split('T')[0];
  const toDate = today.toISOString().split('T')[0];

  // Nutzt nun den fachlich richtigen Tracking-Service
  const entries = await trackingService.getEntriesForPeriod(userId, fromDate, toDate);

  // Hier würde die eigentliche Statistikberechnung stattfinden
  const totalEntries = entries.length;
  const habitsTracked = new Set(entries.map(entry => entry.habit.name)).size;

  return {
    totalEntries: totalEntries,
    habitsTracked: habitsTracked,
    period: `${fromDate} to ${toDate}`,
    // ... weitere Statistikdaten
  };
};