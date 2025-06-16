import express, { Response } from "express";
import { OpenAI } from "openai";
import { AuthRequest, fetchEvents, fetchUserProfile } from "./eventsController";
import { EventGPT } from "../types/eventTypes";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY as string,
});

export const GPTreq = async (req: AuthRequest, res: Response) => {
  const id = req.user?.id;

  if (!id) {
    res.status(400).json({ error: "No user ID provided." });
    return;
  }

  try {
    const user = fetchUserProfile(id);
    const events = fetchEvents({
      audience: "public",
      userId: id,
    });
    const interestedEvents = fetchEvents({
      audience: "public",
      userId: id,
      interested: true,
    });

    if (!user || !Array.isArray(user.tags)) {
      res.status(400).json({ error: "User tags not found." });
      return;
    }

    const functions = [
      {
        name: "returnFilteredEvents",
        description: "Return only events relevant to the user's interests",
        parameters: {
          type: "object",
          properties: {
            events: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "number" },
                  title: { type: "string" },
                  description: { type: "string" },
                  location: { type: "string" },
                  date: { type: "string" },
                  image: { type: ["string", "null"] },
                  maxAttendees: { type: "number" },
                  organizerId: { type: "number" },
                  organizerName: { type: "string" },
                  organizerAvatar: { type: ["string", "null"] },
                  attendees: { type: "number" },
                  interested: { type: "number" },
                  comments: { type: "number" },
                },
                required: [
                  "id",
                  "title",
                  "description",
                  "location",
                  "date",
                  "image",
                  "maxAttendees",
                  "organizerId",
                  "organizerName",
                  "organizerAvatar",
                  "attendees",
                  "interested",
                  "comments",
                ],
              },
            },
          },
          required: ["events"],
        },
      },
    ];

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      temperature: 0.3,
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant that filters event data based on user interests. You must only return events that are semantically related to the user's tags. If no events match, return an empty array.",
        },
        {
          role: "user",
          content: `
      The user has the following interests (tags): ${JSON.stringify(user.tags)}
      The user is also interested in going in the following events: ${JSON.stringify(interestedEvents)}
      
      You are given a list of events. Each event contains details like title, description, and location.
      
      Your task is to:
      - Analyze which events are thematically relevant to the user's tags and interested events.
      - Return ONLY the matching events using the function below.
      - DO NOT include unrelated events.
      - You MUST use the title and description fields to determine relevance.
      - Respond by calling the function \`returnFilteredEvents\` with ONLY the filtered list.
      
      Events:
      ${JSON.stringify(events)}
          `,
        },
      ],      
      functions,
      function_call: { name: "returnFilteredEvents" },
    });

    const functionArgs = completion.choices[0]?.message?.function_call?.arguments;

    if (!functionArgs) {
      throw new Error("No function arguments returned from OpenAI.");
    }

    const parsed = JSON.parse(functionArgs);
    const eventss = parsed.events as EventGPT[];
    const filteredEvents = eventss.filter((even) => {
      return interestedEvents.indexOf(even) == -1; // FIX THE FILTER, JAVASCRIPT CONSIDERS THE OBJECT DIFFERENT BECAUSE THEY ARE FORM DIFFERENT SOURCES
    });

    res.json({ events: filteredEvents });
  } catch (error) {
    console.error("ChatGPT function calling error:", error);
    res.status(500).json({ error: "Failed to filter events with ChatGPT." });
  }
};
