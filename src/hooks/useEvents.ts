import { useState, useEffect, useCallback } from 'react';
import { eventService } from '../services/eventService';
import type { Event, CreateEventInput, UpdateEventInput } from '../types/event';

export const useEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedEvents = await eventService.getAll();
      setEvents(fetchedEvents);
    } catch (err) {
      console.error('Failed to fetch events:', err);
      setError('Failed to load events.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const createEvent = useCallback(async (input: CreateEventInput) => {
    try {
      const newEvent = await eventService.create(input);
      setEvents((prev) => [...prev, newEvent]);
      return newEvent;
    } catch (err) {
      console.error('Failed to create event:', err);
      setError('Failed to create event.');
      throw err;
    }
  }, []);

  const updateEvent = useCallback(async (input: UpdateEventInput) => {
    try {
      const updated = await eventService.update(input);
      setEvents((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
      return updated;
    } catch (err) {
      console.error('Failed to update event:', err);
      setError('Failed to update event.');
      throw err;
    }
  }, []);

  const deleteEvent = useCallback(async (id: string) => {
    try {
      await eventService.delete(id);
      setEvents((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      console.error('Failed to delete event:', err);
      setError('Failed to delete event.');
      throw err;
    }
  }, []);

  const getEventById = useCallback(
    (id: string) => {
      return events.find((e) => e.id === id);
    },
    [events]
  );

  const getEventsForDate = useCallback(
    (date: Date) => {
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const dateStr = `${day}-${month}`;
      return events.filter((e) => e.date === dateStr);
    },
    [events]
  );

  return {
    events,
    loading,
    error,
    createEvent,
    updateEvent,
    deleteEvent,
    getEventById,
    getEventsForDate,
    fetchEvents,
  };
};

