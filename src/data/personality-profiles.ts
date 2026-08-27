/**
 * FACT 360 — 16 Personality Profiles.
 * Keyed by the four-letter code derived from the assessment answers.
 * Rendered in the client report whenever a personality code is available.
 */
export type PersonalityProfile = {
  code: string;
  name: string;
  role: "Analyst" | "Diplomat" | "Sentinel" | "Explorer";
  traits: string[];
  summary: string;
  strengths: string[];
  weaknesses: string[];
  communication: string;
  workplace: string;
  leadership: string;
  development: string[];
  bestContribution: string;
  watchArea: string;
};

export const ROLE_THEME: Record<PersonalityProfile["role"], { bg: string; text: string; ring: string; chip: string }> = {
  Analyst: { bg: "bg-violet-50", text: "text-violet-700", ring: "border-violet-200", chip: "bg-violet-600 text-white" },
  Diplomat: { bg: "bg-emerald-50", text: "text-emerald-700", ring: "border-emerald-200", chip: "bg-emerald-600 text-white" },
  Sentinel: { bg: "bg-sky-50", text: "text-sky-700", ring: "border-sky-200", chip: "bg-sky-600 text-white" },
  Explorer: { bg: "bg-amber-50", text: "text-amber-700", ring: "border-amber-200", chip: "bg-amber-600 text-white" },
};

export const PERSONALITY_PROFILES: Record<string, PersonalityProfile> = {
  INTJ: {
    code: "INTJ", name: "Architect", role: "Analyst",
    traits: ["Introverted", "Intuitive", "Thinking", "Judging"],
    summary:
      "Architects tend to approach life through strategy, analysis, independent thinking and long-term planning. They enjoy understanding complex systems, identifying better ways of doing things, and working toward clearly defined outcomes.",
    strengths: ["Strategic and long-range thinking", "Strong analytical and problem-solving ability", "Independent decision-making", "High standards for quality", "Comfortable working with complex information", "Willingness to revise ideas when evidence changes"],
    weaknesses: ["May appear overly critical or distant", "Can give too much importance to logic", "May become impatient with inefficient processes", "Can resist rules they consider unnecessary", "May find emotional or highly social situations difficult"],
    communication: "Usually prefers concise, logical and meaningful conversations rather than extended small talk.",
    workplace: "Performs particularly well when given autonomy, challenging problems and clearly defined objectives.",
    leadership: "Strategic, independent and future-focused. Often concentrates on improving systems rather than simply maintaining them.",
    development: ["Listen more actively to alternative viewpoints", "Balance logic with human considerations", "Improve interpersonal communication", "Allow flexibility when circumstances change"],
    bestContribution: "Strategy, innovation and complex problem-solving",
    watchArea: "Interpersonal flexibility and excessive perfectionism",
  },
  INTP: {
    code: "INTP", name: "Logician", role: "Analyst",
    traits: ["Introverted", "Intuitive", "Thinking", "Prospecting"],
    summary:
      "Logicians are curious, analytical and concept-oriented. They enjoy investigating how things work and developing explanations or solutions that others may not immediately consider.",
    strengths: ["Logical reasoning", "Intellectual curiosity", "Creative problem-solving", "Open-mindedness", "Ability to identify patterns", "Comfortable exploring unfamiliar ideas"],
    weaknesses: ["May overanalyse rather than act", "Can lose interest during routine execution", "May overlook practical details", "Can find highly structured environments restrictive", "May struggle to communicate ideas simply"],
    communication: "Prefers discussions involving ideas, concepts, possibilities and logical reasoning.",
    workplace: "Works well with autonomy and intellectual freedom.",
    leadership: "Usually leads through expertise, ideas and problem-solving rather than authority.",
    development: ["Improve execution and follow-through", "Convert ideas into practical plans", "Communicate complex ideas clearly", "Develop stronger organisational habits"],
    bestContribution: "Innovation and analytical thinking",
    watchArea: "Execution and consistency",
  },
  ENTJ: {
    code: "ENTJ", name: "Commander", role: "Analyst",
    traits: ["Extraverted", "Intuitive", "Thinking", "Judging"],
    summary:
      "Commanders are highly goal-oriented individuals who naturally look for ways to organise people, resources and processes around ambitious objectives, with strong decisiveness and drive for accomplishment.",
    strengths: ["Strong leadership", "Strategic planning", "Decisiveness", "Efficiency orientation", "Confidence", "Persistence", "Ability to motivate teams"],
    weaknesses: ["May become overly dominant", "Can become impatient with slower decision-makers", "May focus too heavily on results", "Can dismiss emotional considerations", "May struggle to accept opposing opinions"],
    communication: "Direct, confident and outcome-oriented.",
    workplace: "Thrives in environments where goals are ambitious and measurable.",
    leadership: "Visionary, decisive and performance-focused.",
    development: ["Practice patience", "Encourage different viewpoints", "Develop emotional awareness", "Balance efficiency with employee wellbeing"],
    bestContribution: "Direction, execution and organisational leadership",
    watchArea: "Over-control and insufficient emotional consideration",
  },
  ENTP: {
    code: "ENTP", name: "Debater", role: "Analyst",
    traits: ["Extraverted", "Intuitive", "Thinking", "Prospecting"],
    summary: "Debaters enjoy exploring possibilities, questioning assumptions and testing ideas from different angles.",
    strengths: ["Creativity", "Innovation", "Adaptability", "Strong verbal reasoning", "Challenging conventional thinking", "Rapid idea generation"],
    weaknesses: ["May debate simply for intellectual stimulation", "Can lose interest after the idea stage", "May overlook details", "Can appear argumentative", "May struggle with routine implementation"],
    communication: "Energetic, questioning and intellectually playful.",
    workplace: "Best in environments where experimentation and new ideas are encouraged.",
    leadership: "Encourages innovation and challenges teams to reconsider existing approaches.",
    development: ["Improve follow-through", "Respect different communication styles", "Strengthen attention to detail", "Convert ideas into measurable outcomes"],
    bestContribution: "Innovation and strategic alternatives",
    watchArea: "Consistency and implementation",
  },
  INFJ: {
    code: "INFJ", name: "Advocate", role: "Diplomat",
    traits: ["Introverted", "Intuitive", "Feeling", "Judging"],
    summary:
      "Advocates combine deep personal values with an interest in understanding people and the meaning behind situations, with strong insight, principles and idealistic orientation.",
    strengths: ["Strong empathy", "Insight into people", "Purpose-driven thinking", "Creativity", "Ethical awareness", "Long-term vision"],
    weaknesses: ["May become perfectionistic", "Can absorb other people's problems", "May avoid confrontation", "Can become exhausted from helping others", "May struggle to turn large visions into practical routines"],
    communication: "Thoughtful, empathetic and purposeful.",
    workplace: "Prefers meaningful work where values and purpose are important.",
    leadership: "Inspirational and people-development oriented.",
    development: ["Set healthy boundaries", "Accept practical limitations", "Communicate disagreement directly", "Avoid excessive self-sacrifice"],
    bestContribution: "People development and purpose-driven leadership",
    watchArea: "Burnout and perfectionism",
  },
  INFP: {
    code: "INFP", name: "Mediator", role: "Diplomat",
    traits: ["Introverted", "Intuitive", "Feeling", "Prospecting"],
    summary:
      "Mediators are reflective and values-driven. They often seek authenticity, meaningful work and opportunities to contribute to something they consider worthwhile.",
    strengths: ["Empathy", "Creativity", "Strong personal values", "Open-mindedness", "Deep listening", "Adaptability"],
    weaknesses: ["May avoid difficult confrontation", "Can take criticism personally", "May struggle with highly rigid environments", "Can become indecisive", "May prioritise ideals over practical constraints"],
    communication: "Gentle, personal and reflective.",
    workplace: "Works best when given autonomy and meaningful objectives.",
    leadership: "Supportive and empowering rather than authoritarian.",
    development: ["Become more assertive", "Strengthen decision-making", "Handle criticism constructively", "Improve planning and execution"],
    bestContribution: "Creativity, empathy and values",
    watchArea: "Assertiveness and execution",
  },
  ENFJ: {
    code: "ENFJ", name: "Protagonist", role: "Diplomat",
    traits: ["Extraverted", "Intuitive", "Feeling", "Judging"],
    summary:
      "Protagonists are people-focused leaders who often motivate others through communication, encouragement and a strong sense of collective purpose.",
    strengths: ["Leadership", "Communication", "Team building", "Empathy", "Motivation", "Relationship development"],
    weaknesses: ["May take on too much responsibility", "Can become overly concerned with others' opinions", "May struggle to establish boundaries", "Can find criticism difficult", "May prioritise harmony over difficult decisions"],
    communication: "Warm, persuasive and encouraging.",
    workplace: "Thrives in collaborative environments.",
    leadership: "Inspirational, developmental and team-centred.",
    development: ["Delegate effectively", "Set boundaries", "Make difficult decisions objectively", "Avoid taking responsibility for everything"],
    bestContribution: "Team motivation and people development",
    watchArea: "Overcommitment and emotional burden",
  },
  ENFP: {
    code: "ENFP", name: "Campaigner", role: "Diplomat",
    traits: ["Extraverted", "Intuitive", "Feeling", "Prospecting"],
    summary:
      "Campaigners are energetic, imaginative and possibility-oriented. They enjoy connecting people, exploring ideas and discovering new opportunities.",
    strengths: ["Creativity", "Enthusiasm", "Communication", "Adaptability", "Networking", "Idea generation"],
    weaknesses: ["May become distracted", "Can struggle with repetitive work", "May begin many projects", "Can overlook operational details", "May make decisions strongly influenced by personal values"],
    communication: "Expressive, enthusiastic and engaging.",
    workplace: "Prefers flexibility, variety and interaction.",
    leadership: "Motivational and opportunity-focused.",
    development: ["Improve prioritisation", "Complete projects consistently", "Develop structured routines", "Balance enthusiasm with feasibility"],
    bestContribution: "Energy, creativity and networking",
    watchArea: "Focus and completion",
  },
  ISTJ: {
    code: "ISTJ", name: "Logistician", role: "Sentinel",
    traits: ["Introverted", "Observant", "Thinking", "Judging"],
    summary:
      "Logisticians tend to value reliability, facts, structure and responsibility, with a strong commitment to obligations and dependable execution.",
    strengths: ["Reliability", "Discipline", "Organisation", "Accuracy", "Responsibility", "Practical decision-making", "Strong process awareness"],
    weaknesses: ["May resist unfamiliar approaches", "Can become rigid about procedures", "May appear insensitive when being factual", "Can judge others against their own standards", "May take on too much responsibility"],
    communication: "Clear, factual and straightforward.",
    workplace: "Performs strongly where processes, standards and responsibilities are clearly defined.",
    leadership: "Structured, accountable and process-oriented.",
    development: ["Become more flexible", "Consider individual circumstances", "Delegate responsibilities", "Accept constructive experimentation"],
    bestContribution: "Reliability and operational consistency",
    watchArea: "Rigidity and excessive responsibility",
  },
  ISFJ: {
    code: "ISFJ", name: "Defender", role: "Sentinel",
    traits: ["Introverted", "Observant", "Feeling", "Judging"],
    summary:
      "Defenders are dependable and considerate team members who often place strong importance on responsibility, stability and supporting people around them.",
    strengths: ["Reliability", "Cooperation", "Attention to detail", "Patience", "Loyalty", "Supportiveness"],
    weaknesses: ["May avoid confrontation", "Can struggle to say no", "May resist major changes", "Can take on too much work", "May put others' needs before their own"],
    communication: "Respectful, supportive and considerate.",
    workplace: "Prefers stable, cooperative and clearly organised environments.",
    leadership: "Supportive and service-oriented.",
    development: ["Build assertiveness", "Establish boundaries", "Become comfortable with change", "Delegate more effectively"],
    bestContribution: "Team stability and dependable support",
    watchArea: "Boundaries and adaptation",
  },
  ESTJ: {
    code: "ESTJ", name: "Executive", role: "Sentinel",
    traits: ["Extraverted", "Observant", "Thinking", "Judging"],
    summary:
      "Executives are practical organisers who value structure, accountability and effective execution, with a strong hands-on approach to getting things done and leading others.",
    strengths: ["Organisation", "Leadership", "Accountability", "Decision-making", "Discipline", "Execution", "Process management"],
    weaknesses: ["May become overly controlling", "Can be impatient with inefficiency", "May resist unconventional approaches", "Can appear overly direct", "May underestimate emotional factors"],
    communication: "Direct, structured and action-oriented.",
    workplace: "Performs well in structured environments with measurable goals.",
    leadership: "Accountability-driven and operationally focused.",
    development: ["Improve flexibility", "Listen before deciding", "Encourage innovation", "Understand different emotional responses"],
    bestContribution: "Execution and organisational discipline",
    watchArea: "Flexibility and interpersonal sensitivity",
  },
  ESFJ: {
    code: "ESFJ", name: "Consul", role: "Sentinel",
    traits: ["Extraverted", "Observant", "Feeling", "Judging"],
    summary:
      "Consuls are socially engaged and supportive individuals who often focus on cooperation, belonging and maintaining healthy relationships.",
    strengths: ["Teamwork", "Communication", "Reliability", "Relationship building", "Empathy", "Organisation"],
    weaknesses: ["May seek excessive approval", "Can avoid uncomfortable conversations", "May become attached to familiar practices", "Can take criticism personally", "May prioritise harmony over objectivity"],
    communication: "Friendly, encouraging and relationship-focused.",
    workplace: "Thrives in cooperative environments where people interact regularly.",
    leadership: "Supportive and team-centred.",
    development: ["Build independent decision-making", "Become comfortable with constructive conflict", "Encourage new approaches", "Develop stronger boundaries"],
    bestContribution: "Team cohesion and relationship management",
    watchArea: "Resistance to change and approval-seeking",
  },
  ISTP: {
    code: "ISTP", name: "Virtuoso", role: "Explorer",
    traits: ["Introverted", "Observant", "Thinking", "Prospecting"],
    summary:
      "Virtuosos are practical, curious problem-solvers who often prefer learning through direct experience and experimentation.",
    strengths: ["Practical problem-solving", "Adaptability", "Technical thinking", "Calmness under pressure", "Independence", "Hands-on learning"],
    weaknesses: ["May dislike excessive structure", "Can lose interest in routine", "May communicate too briefly", "Can take unnecessary risks", "May struggle with long-term planning"],
    communication: "Concise, practical and fact-focused.",
    workplace: "Prefers flexibility, autonomy and hands-on challenges.",
    leadership: "Situational and practical.",
    development: ["Improve long-term planning", "Communicate expectations clearly", "Develop consistency", "Consider wider organisational consequences"],
    bestContribution: "Practical solutions and technical problem-solving",
    watchArea: "Planning and communication",
  },
  ISFP: {
    code: "ISFP", name: "Adventurer", role: "Explorer",
    traits: ["Introverted", "Observant", "Feeling", "Prospecting"],
    summary:
      "Adventurers tend to be flexible, observant and personally expressive. They often prefer authentic experiences and environments that allow room for creativity and independence.",
    strengths: ["Creativity", "Adaptability", "Observation", "Empathy", "Practical awareness", "Open-mindedness"],
    weaknesses: ["May avoid long-term planning", "Can struggle with confrontation", "May dislike rigid systems", "Can take criticism personally", "May delay difficult decisions"],
    communication: "Calm, personal and considerate.",
    workplace: "Prefers flexibility and opportunities for creative or practical expression.",
    leadership: "Supportive and adaptable.",
    development: ["Strengthen planning", "Develop assertiveness", "Become more comfortable with structured feedback", "Improve decision-making under pressure"],
    bestContribution: "Creativity and adaptability",
    watchArea: "Planning and difficult conversations",
  },
  ESTP: {
    code: "ESTP", name: "Entrepreneur", role: "Explorer",
    traits: ["Extraverted", "Observant", "Thinking", "Prospecting"],
    summary:
      "Entrepreneurs are action-oriented and responsive to opportunities. They tend to enjoy fast-moving environments where decisions and results are visible.",
    strengths: ["Adaptability", "Confidence", "Practical problem-solving", "Persuasion", "Energy", "Fast decision-making"],
    weaknesses: ["Can act impulsively", "May underestimate long-term consequences", "Can become bored with routine", "May take unnecessary risks", "Can overlook planning"],
    communication: "Confident, direct and energetic.",
    workplace: "Performs well in dynamic, competitive and fast-moving environments.",
    leadership: "Action-oriented and opportunity-driven.",
    development: ["Improve strategic planning", "Evaluate risks before acting", "Build patience", "Strengthen consistency"],
    bestContribution: "Action, opportunity recognition and rapid problem-solving",
    watchArea: "Risk management and long-term planning",
  },
  ESFP: {
    code: "ESFP", name: "Entertainer", role: "Explorer",
    traits: ["Extraverted", "Observant", "Feeling", "Prospecting"],
    summary:
      "Entertainers are energetic, socially aware and experience-oriented. They often bring enthusiasm and engagement to teams and customer-facing environments.",
    strengths: ["Communication", "Enthusiasm", "Social awareness", "Adaptability", "Team engagement", "Relationship building"],
    weaknesses: ["May struggle with long-term planning", "Can become distracted", "May avoid difficult decisions", "Can prefer immediate results", "May find highly repetitive environments difficult"],
    communication: "Expressive, friendly and engaging.",
    workplace: "Thrives in active, collaborative and people-facing environments.",
    leadership: "Motivational and relationship-focused.",
    development: ["Improve planning", "Develop consistency", "Strengthen decision-making", "Balance spontaneity with organisational priorities"],
    bestContribution: "Engagement, communication and team energy",
    watchArea: "Strategic planning and consistency",
  },
};

export const getPersonalityProfile = (code?: string | null) =>
  code ? PERSONALITY_PROFILES[code.toUpperCase()] ?? null : null;
