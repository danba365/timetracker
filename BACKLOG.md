# Backlog

## Phase 2: Task Movement & Updates via AI Coach

### Overview
Enable the AI Coach to move and update existing tasks using natural language commands.

### Features to Implement

#### 1. Task Movement
- Move tasks to different dates
- Reschedule tasks by relative dates
- Batch move multiple tasks

**Examples:**
- English:
  - "Move my meeting with Shay to Friday"
  - "Reschedule my gym session to tomorrow"
  - "Move all my tasks from Monday to Tuesday"
  
- Hebrew:
  - "העבר את הפגישה עם שי ליום שישי"
  - "תזיז את החדר כושר למחר"
  - "העבר את כל המשימות מיום שני ליום שלישי"

#### 2. Task Updates
- Update task times
- Change task priority
- Update task descriptions
- Modify task categories

**Examples:**
- English:
  - "Change my meeting time to 3pm"
  - "Make the presentation task high priority"
  - "Update the gym task description to include cardio"
  
- Hebrew:
  - "שנה את הפגישה ל-3 אחר הצהריים"
  - "שנה את המצגת לעדיפות גבוהה"
  - "עדכן את החדר כושר להכיל קרדיו"

#### 3. Task Completion & Deletion
- Mark tasks as complete
- Delete tasks
- Cancel recurring tasks

**Examples:**
- English:
  - "Mark my gym session as complete"
  - "Delete the meeting with Dan"
  - "Cancel my recurring Monday meetings"
  
- Hebrew:
  - "סמן את החדר כושר כהושלם"
  - "מחק את הפגישה עם דן"
  - "בטל את הפגישות החוזרות שלי בימי שני"

### Technical Implementation

1. **Add new OpenAI functions:**
   - `update_task` - Update task properties
   - `move_task` - Move task to different date/time
   - `delete_task` - Delete a task
   - `complete_task` - Mark task as complete

2. **Task identification:**
   - Match tasks by title (fuzzy matching)
   - Match by date and category
   - Handle multiple matches (ask for clarification)

3. **Update ChatWidget.tsx:**
   - Handle `update_task`, `move_task`, `delete_task`, `complete_task` actions
   - Show confirmation messages
   - Handle errors (task not found, ambiguous matches)

4. **Update coach.ts system prompts:**
   - Add instructions for task identification
   - Add examples of update/move/delete commands
   - Handle Hebrew commands

5. **Date/time parsing for updates:**
   - Reuse existing `parseNaturalDate` and `parseNaturalTime`
   - Handle relative dates ("move to next week")

### Estimated Effort
- Development: 1-2 days
- Testing: 0.5 day
- Total: 1.5-2.5 days

### Dependencies
- Phase 1 (✅ Complete)
- Phase 3 (✅ Complete)

---

## Phase 4: Voice Input/Output (Future)

### Overview
Add voice input and output capabilities to the AI Coach for hands-free interaction.

### Features to Implement

1. **Voice Input:**
   - Speech-to-text using Web Speech API
   - Support for Hebrew and English
   - Push-to-talk or continuous listening

2. **Voice Output:**
   - Text-to-speech for AI responses
   - Natural voice in Hebrew and English
   - Adjustable speech rate

3. **UI Updates:**
   - Microphone button in chat
   - Visual indicator when listening
   - Audio waveform animation

### Technical Implementation
- Web Speech API (browser-based)
- Or external API (e.g., Google Cloud Speech-to-Text, ElevenLabs)
- Handle permissions and browser compatibility

### Estimated Effort
- Development: 2-3 days
- Testing: 1 day
- Total: 3-4 days

---

## Future Enhancements

### Multi-User Support
- User authentication (Supabase Auth)
- Social logins (Google, Apple, GitHub)
- Row Level Security (RLS) policies
- User-specific data isolation

**Estimated effort:** 3-5 days

### Additional Languages
- Support for more languages (Spanish, French, etc.)
- Update i18n files
- Add locale-specific date/time parsing
- Update AI Coach prompts

**Estimated effort:** 1-2 days per language

### Advanced AI Features
- Smart task suggestions based on patterns
- Automatic task scheduling optimization
- Conflict detection and resolution
- Weekly planning assistant
- Goal tracking and recommendations

**Estimated effort:** 5-10 days

### Integration Features
- Calendar sync (Google Calendar, Outlook)
- Email integration
- Slack/Teams notifications
- Import/export tasks
- API for third-party integrations

**Estimated effort:** 5-7 days

---

## Priority Order

1. ✅ **Phase 1: Task Creation (English)** - COMPLETE
2. ✅ **Phase 3: Task Creation (Hebrew)** - COMPLETE
3. 🔜 **Phase 2: Task Movement & Updates** - NEXT
4. 📅 **Phase 4: Voice Input/Output** - FUTURE
5. 📅 **Multi-User Support** - FUTURE
6. 📅 **Additional Languages** - FUTURE
7. 📅 **Advanced AI Features** - FUTURE
8. 📅 **Integration Features** - FUTURE

