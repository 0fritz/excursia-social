import { Request, Response } from 'express';
import db from '../db';
import { Event, EventDetail, EventGPT } from '../types/eventTypes';
import { User } from '../types/userTypes';

export interface AuthRequest extends Request {
  user?: { id: number };
}

export const getEventsHandler = (req: AuthRequest, res: Response): void => {
  const { audience, search, applied, interested } = req.query;
  const userId = req.user?.id;

  if (audience != "public" && audience != "friends") {
    res.status(400).json({ error: "Audience must be public or friends" });
    return;
  }

  let appliedBool: boolean | undefined;
  if (applied === "true") appliedBool = true;
  else if (applied === "false") appliedBool = false;

  let interestedBool: boolean | undefined;
  if (interested === "true") interestedBool = true;
  else if (interested === "false") interestedBool = false;

  try {
    const events = fetchEvents({
      audience: audience as "public" | "friends",
      search: search as string,
      userId,
      applied: appliedBool,
      interested: interestedBool
    });

    res.json(events);
  } catch (err: any) {
    if (err.message === "Authentication required") {
      res.status(401).json({ error: err.message });
    } else {
      console.error("Error fetching events:", err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
};




export const getPublicEvents = (req: Request, res: Response) => {
  try {
    const stmt = db.prepare(`
      SELECT
        e.id,
        e.title,
        e.description,
        e.location,
        e.date,
        e.imageUrl AS image,
        e.maxAttendees,
        e.audience,
        e.userId AS organizerId,
        u.name AS organizerName,
        u.profile_picture AS organizerAvatar,
        e.interested,
        (
          SELECT COUNT(*) FROM event_attendees WHERE event_id = e.id
        ) AS attendees,
        (
          SELECT COUNT(*) FROM event_comments WHERE event_id = e.id
        ) AS comments
      FROM events e
      JOIN users u ON e.userId = u.id
      WHERE e.audience = 'public'
      ORDER BY e.date DESC
    `);

    const rows = stmt.all();

    const events = rows.map((row: any) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      location: row.location,
      date: row.date,
      image: row.image,
      maxAttendees: row.maxAttendees,
      audience: row.audience,
      interested: row.interested,
      attendees: row.attendees,
      comments: row.comments,
      organizer: {
        id: row.organizerId,
        name: row.organizerName,
        avatar: row.organizerAvatar,
      },
    }));

    res.json(events);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getUserEvents = (req: Request, res: Response):void => {
  const userId = Number(req.params.id);
  if (isNaN(userId)) {
    res.status(400).json({ error: 'Invalid user ID' });
    return;
  }

  const events = db.prepare(`
    SELECT 
      e.id, e.title, e.description, e.location, e.date, e.imageUrl as image,
      e.maxAttendees, e.interested,
      u.id as organizerId, u.name as organizerName, u.profile_picture as organizerAvatar,
      (SELECT COUNT(*) FROM event_attendees WHERE event_id = e.id) as attendees,
      (SELECT COUNT(*) FROM event_comments WHERE event_id = e.id) as comments
    FROM events e
    JOIN users u ON e.userId = u.id
    WHERE e.userId = ?
    ORDER BY e.date DESC
  `).all(userId);

  res.json(events);
};


export const createEvent = (req: Request, res: Response): void => {
  try {
    const {
      title,
      description,
      date,
      location,
      audience = 'public',
      maxAttendees,
      image,
    } = req.body;

    const userId = (req as any).user?.id;

    if (!title || !description || !date || !location) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const stmt = db.prepare(`
      INSERT INTO events (title, description, date, imageUrl, audience, userId, location, maxAttendees)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      title,
      description,
      date,
      image,
      audience,
      userId,
      location,
      maxAttendees ? parseInt(maxAttendees) : null
    );

    res.status(201).json({ id: result.lastInsertRowid });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};


// export const deleteEvent = (req: Request, res: Response) => {
//   try {
//     const id = parseInt(req.params.id);
//     const userId = (req as any).user?.id;

//     if (!userId) {
//       return res.status(401).json({ error: 'Unauthorized' });
//     }

//     const getStmt = db.prepare('SELECT userId FROM events WHERE id = ?');
//     const event = getStmt.get(id);

//     if (!event) {
//       return res.status(404).json({ error: 'Event not found' });
//     }

//     if (event.userId !== userId) {
//       return res.status(403).json({ error: 'You are not allowed to delete this event' });
//     }

//     const deleteStmt = db.prepare('DELETE FROM events WHERE id = ?');
//     deleteStmt.run(id);

//     res.status(200).json({ message: 'Event deleted successfully' });
//   } catch (err: any) {
//     res.status(500).json({ error: err.message });
//   }
// };


export const markInterested = (req: Request, res: Response): void => {
  const eventId = parseInt(req.params.id);
  const userId = (req as any).user?.id;

  if (!userId) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  try {
    const stmt = db.prepare(`
      INSERT OR IGNORE INTO event_interested (user_id, event_id)
      VALUES (?, ?)
    `);
    stmt.run(userId, eventId);
    db.prepare(`
      UPDATE events SET interested = interested + 1 WHERE id = ?
    `).run(eventId);
    res.status(200).json({ message: 'Marked as interested' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const unmarkInterested = (req: Request, res: Response): void => {
  const eventId = parseInt(req.params.id);
  const userId = (req as any).user?.id;

  if (!userId) {
    res.status(401).json({ error: 'Unauthorized' });
    return; 
  }

  try {
    const stmt = db.prepare(`
      DELETE FROM event_interested WHERE user_id = ? AND event_id = ?
    `);
    stmt.run(userId, eventId);
    db.prepare(`
      UPDATE events SET interested = interested - 1 WHERE id = ?
    `).run(eventId);
    res.status(200).json({ message: 'Removed interest' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const checkInterested = (req: Request, res: Response): void => {
  const eventId = parseInt(req.params.id);
  const userId = (req as any).user?.id;

  if (!userId) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  try {
    // Check if the user is interested in the event
    const interestStmt = db.prepare(`
      SELECT 1 FROM event_interested WHERE user_id = ? AND event_id = ?
    `);
    const interestRow = interestStmt.get(userId, eventId);

    // Count how many users are interested in the event
    const countStmt = db.prepare(`
      SELECT COUNT(*) AS count FROM event_interested WHERE event_id = ?
    `);
    const countRow:any = countStmt.get(eventId);

    res.json({ 
      interested: !!interestRow, 
      count: countRow.count 
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};



export const getEventCardData = (req: Request, res: Response): void => {
  const eventId = Number(req.params.id);
  if (isNaN(eventId)) {
    res.status(400).json({ error: 'Invalid event ID' });
    return;
  }

  const event = db.prepare(`
    SELECT 
      e.id, e.title, e.description, e.location, e.date, e.imageUrl as image,
      e.maxAttendees, e.interested,
      u.id as organizerId, u.name as organizerName, u.avatar as organizerAvatar
    FROM events e
    JOIN users u ON e.userId = u.id
    WHERE e.id = ?
  `).get(eventId) as Event;

  if (!event) {
    res.status(404).json({ error: 'Event not found' });
    return;
  } 

  const attendeesRow = db.prepare(`
    SELECT COUNT(*) as count FROM event_attendees WHERE event_id = ?
  `).get(eventId) as {count: number};

  const commentsRow = db.prepare(`
    SELECT COUNT(*) as count FROM event_comments WHERE event_id = ?
  `).get(eventId) as {count: number};

  const attendees = attendeesRow.count;
  const comments = commentsRow.count;

  res.json({
    id: event.id,
    title: event.title,
    description: event.description,
    location: event.location,
    date: event.date,
    image: event.image,
    organizer: {
      id: event.organizer.id,
      name: event.organizer.name,
      avatar: event.organizer.avatar
    },
    attendees,
    maxAttendees: event.maxAttendees,
    interested: event.interested,
    comments
  });
};

export const getEventById = (req: AuthRequest, res: Response): void => {
  const id = parseInt(req.params.id);

  const event = db.prepare(`
    SELECT e.id, e.title, e.description, e.location, e.date, e.imageUrl, e.maxAttendees, e.audience, e.interested, e.userId,
           u.name as organizer_name, u.profile_picture as organizer_avatar
    FROM events e
    JOIN users u ON u.id = e.userId
    WHERE e.id = ?
  `).get(id) as {
    id: number;
    title: string;
    description: string;
    location: string;
    date: string;
    imageUrl: string;
    maxAttendees: number;
    audience: 'public' | 'friends';
    interested: number;
    userId: number;
    organizer_name: string;
    organizer_avatar: string;
  };

  if (!event) {
    res.status(404).json({ error: 'Event not found' });
    return;
  }

  const attendees = db.prepare(`
    SELECT u.id, u.name, u.profile_picture as avatar
    FROM event_attendees ea
    JOIN users u ON u.id = ea.user_id
    WHERE ea.event_id = ? OR 1
  `).all(id) as EventDetail['attendees'];

  console.log(attendees)

  const commentsRaw = db.prepare(`
    SELECT ec.id, ec.content, ec.created_at as timestamp,
           u.id as user_id, u.name, u.profile_picture as avatar
    FROM event_comments ec
    JOIN users u ON u.id = ec.user_id
    WHERE ec.event_id = ?
    ORDER BY ec.created_at DESC
  `).all(id);


  const comments: EventDetail['comments'] = commentsRaw.map((c: any) => ({
    id: c.id,
    content: c.content,
    timestamp: c.timestamp,
    user: {
      id: c.user_id,
      name: c.name,
      avatar: c.avatar,
    },
  }));

  let applicationStatus: 'pending' | 'accepted' | 'rejected' | null = null;
  if (req.user) {
    const app:any = db.prepare(`
      SELECT status FROM event_applications WHERE event_id = ? AND user_id = ?
    `).get(id, req.user.id);
    if (app) {
      applicationStatus = app.status as 'pending' | 'accepted' | 'rejected';
    }
  }

  const result: EventDetail = {
    id: event.id,
    title: event.title,
    description: event.description,
    location: event.location,
    date: event.date,
    imageUrl: event.imageUrl,
    maxAttendees: event.maxAttendees,
    audience: event.audience,
    interested: event.interested,
    userId: event.userId,
    organizer: {
      id: event.userId,
      name: event.organizer_name,
      avatar: event.organizer_avatar,
    },
    attendees,
    comments,
    applicationStatus,
  };

  res.json(result);
};

export const applyToEvent = (req: AuthRequest, res: Response): void => {
  const userId = req.user?.id;
  const { eventId } = req.body;

  if (!userId || typeof eventId !== 'number') {
    res.status(400).json({ error: 'Event ID is required' });
    return;
  }

  db.prepare(`
    INSERT OR IGNORE INTO event_applications (user_id, event_id, status)
    VALUES (?, ?, 'pending')
  `).run(userId, eventId);

  res.json({ message: 'Application submitted' });
};

export const respondToEventApplication = (req: AuthRequest, res: Response): void => {
  const { userId, eventId, decision } = req.body;

  if (!userId || !eventId || !['accepted', 'rejected'].includes(decision)) {
    res.status(400).json({ error: 'Valid userId, eventId, and decision are required' });
    return;
  }

  const updateResult = db.prepare(`
    UPDATE event_applications
    SET status = ?
    WHERE user_id = ? AND event_id = ? AND status = 'pending'
  `).run(decision, userId, eventId);

  if (updateResult.changes === 0) {
    res.status(404).json({ error: 'Application not found or already processed' });
    return;
  }

  if (decision === 'accepted') {
    try {
      db.prepare(`
        INSERT OR IGNORE INTO event_attendees (user_id, event_id)
        VALUES (?, ?)
      `).run(userId, eventId);
    } catch (err: any) {
      // Optional: rollback application status if attendee insert fails (advanced)
      res.status(500).json({ error: 'Failed to register attendee: ' + err.message });
      return;
    }
  }

  res.json({ message: `Application ${decision}` });
};


export const getPendingApplications = (req: AuthRequest, res: Response): void => {
  const ownerId = req.user?.id;

  const rows = db.prepare(`
    SELECT ea.user_id, ea.event_id
    FROM event_applications ea
    JOIN events e ON ea.event_id = e.id
    WHERE ea.status = 'pending' AND e.userId = ?
  `).all(ownerId);

  res.json({ applications: rows });
};

export interface FetchEventsOptions {
  audience?: "friends" | "public";
  search?: string;
  userId?: number;
  interested?: boolean;
}

export function fetchEvents({ audience, search, userId, interested, applied }: FetchEventsOptions & { applied?: boolean }): EventGPT[] {
  if ((audience === "friends" || audience === "public" || interested !== undefined || applied !== undefined) && !userId) {
    throw new Error("Authentication required");
  }

  const params: any[] = [];
  let searchCondition = "";
  let audienceCondition = "1=1"; // default no-op
  let interestedCondition = "";
  let appliedCondition = "";

  if (search && typeof search === "string") {
    const like = `%${search}%`;
    searchCondition = `
      AND (
        events.title LIKE ? OR
        events.description LIKE ? OR
        events.location LIKE ? OR
        events.date LIKE ?
      )
    `;
    params.push(like, like, like, like);
  }

  if (audience === "public") {
    audienceCondition = `
      (
        events.audience = 'public'
        OR (
          events.audience = 'friends'
          AND events.userId IN (
            SELECT user_id2 FROM friendships WHERE user_id1 = ? AND status = 'accepted'
            UNION
            SELECT user_id1 FROM friendships WHERE user_id2 = ? AND status = 'accepted'
          )
        )
      )
    `;
    params.unshift(userId, userId);
  } else if (audience === "friends") {
    audienceCondition = `
      (
        events.userId IN (
          SELECT user_id2 FROM friendships WHERE user_id1 = ? AND status = 'accepted'
          UNION
          SELECT user_id1 FROM friendships WHERE user_id2 = ? AND status = 'accepted'
        )
        AND (events.audience = 'public' OR events.audience = 'friends')
      )
    `;
    params.unshift(userId, userId);
  }

  if (interested === true) {
    console.log("here");
    interestedCondition = `
      AND events.id IN (
        SELECT event_id FROM event_interested WHERE user_id = ?
      )
    `;
    params.unshift(userId);
  } else if (interested === false) {
    console.log("here2");
    interestedCondition = `
      AND events.id NOT IN (
        SELECT event_id FROM event_interested WHERE user_id = ?
      )
    `;
    params.unshift(userId);
  }

  if (applied === true) {
    appliedCondition = `
      AND events.id IN (
        SELECT event_id 
        FROM event_applications 
        WHERE user_id = ? AND status IN ('pending', 'accepted')
      )
    `;
    params.unshift(userId);
  } else if (applied === false) {
    appliedCondition = `
      AND events.id NOT IN (
        SELECT event_id 
        FROM event_applications 
        WHERE user_id = ? AND status IN ('pending', 'accepted')
      )
    `;
    params.unshift(userId);
  }

  const query = `
    SELECT 
      events.id,
      events.title,
      events.description,
      events.location,
      events.date,
      events.imageUrl AS image,
      events.maxAttendees,
      events.userId AS organizerId,
      users.name AS organizerName,
      users.profile_picture AS organizerAvatar,
      (
        SELECT COUNT(*) 
        FROM event_attendees 
        WHERE event_attendees.event_id = events.id
      ) AS attendees,
      (
        SELECT COUNT(*) 
        FROM event_interested 
        WHERE event_interested.event_id = events.id
      ) AS interested,
      (
        SELECT COUNT(*) 
        FROM event_comments 
        WHERE event_comments.event_id = events.id
      ) AS comments
    FROM events
    JOIN users ON users.id = events.userId
    WHERE ${audienceCondition}
    ${interestedCondition}
    ${appliedCondition}
    ${searchCondition}
    ORDER BY date ASC
  `;

  const stmt = db.prepare(query);
  return stmt.all(...params) as EventGPT[];
}



export function fetchUserProfile(userId: number): User {
  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(userId) as User | undefined;

  if (!user) {
    throw new Error("User not found");
  }

  // Fetch tags
  const tags = db.prepare("SELECT tag FROM user_tags WHERE user_id = ?").all(userId) as { tag: string }[];
  user.tags = tags.map(row => row.tag);

  // Fetch interested event IDs
  const interestedRows = db.prepare("SELECT event_id FROM event_interested WHERE user_id = ?").all(userId) as { event_id: number }[];
  user.interestedEvents = interestedRows.map(row => row.event_id);

  return user;
}

export const postComment = (req: Request, res: Response):void => {
  const { eventId } = req.params;
  const userId = (req as any).user?.id;
  const { content } = req.body;

  if (!userId || !content) {
    res.status(400).json({ error: 'Missing user ID or comment content' });
    return;
  }

  try {
    const stmt = db.prepare(`
      INSERT INTO comments (event_id, user_id, content)
      VALUES (?, ?, ?)
    `);
    stmt.run(eventId, userId, content);

    const comment = db.prepare(`
      SELECT comments.id, content, timestamp, users.name, users.profile_picture AS avatar
      FROM comments
      JOIN users ON users.id = comments.user_id
      WHERE comments.event_id = ? AND comments.user_id = ?
      ORDER BY comments.id DESC LIMIT 1
    `).get(eventId, userId);

    res.status(201).json( comment );
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not post comment' });
  }
};

type CommentRow = {
  id: number;
  content: string;
  timestamp: string;
  name: string;
  avatar: string;
};

export const getComments = (req: Request, res: Response) => {
  const { eventId } = req.params;

  try {
    const stmt = db.prepare(`
      SELECT comments.id, content, timestamp, users.name, users.profile_picture AS avatar
      FROM comments
      JOIN users ON users.id = comments.user_id
      WHERE comments.event_id = ?
      ORDER BY comments.timestamp DESC
    `);

    const rows = stmt.all(eventId) as CommentRow[];

    const comments = rows.map(c => ({
      id: c.id,
      content: c.content,
      timestamp: c.timestamp,
      user: {
        name: c.name,
        avatar: c.avatar,
      },
    }));

    res.json(comments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not retrieve comments' });
  }
};











