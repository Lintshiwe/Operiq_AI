#!/usr/bin/env python3
"""Generate Operiq AI Documentation PDF using fpdf2."""

from fpdf import FPDF

class OperiqPDF(FPDF):
    def __init__(self):
        super().__init__("P", "mm", "A4")
        self.set_auto_page_break(True, 25)
        self.accent = (16, 163, 127)  # #10a37f
        self.set_font("Helvetica", "", 10)

    def header(self):
        self.set_fill_color(255, 255, 255)
        self.rect(0, 0, 210, 10, "F")
        self.set_text_color(*self.accent)
        self.set_font("Helvetica", "B", 8)
        self.cell(0, 8, "Operiq AI  |  Technical Documentation", align="L")
        self.ln(12)

    def footer(self):
        self.set_y(-20)
        self.set_text_color(150, 150, 150)
        self.set_font("Helvetica", "", 7)
        self.cell(0, 10, f"Page {self.page_no()}", align="C")

    def section_title(self, title):
        self.set_fill_color(*self.accent)
        self.set_text_color(*self.accent)
        try:
            self.set_font("Inter", "B", 16)
        except:
            self.set_font("Helvetica", "B", 16)
        self.cell(0, 10, title, new_x="LMARGIN", new_y="NEXT")
        self.set_draw_color(*self.accent)
        self.line(self.l_margin, self.get_y(), self.w - self.r_margin, self.get_y())
        self.ln(6)

    def sub_heading(self, text):
        self.set_text_color(40, 40, 40)
        try:
            self.set_font("Inter", "B", 12)
        except:
            self.set_font("Helvetica", "B", 12)
        self.cell(0, 8, text, new_x="LMARGIN", new_y="NEXT")
        self.ln(2)

    def body_text(self, text):
        self.set_text_color(60, 60, 60)
        try:
            self.set_font("Inter", "", 10)
        except:
            self.set_font("Helvetica", "", 10)
        self.multi_cell(0, 5.5, text)
        self.ln(2)

    def bullet(self, text):
        self.body_text(f"  - {text}")

    def add_logo_watermark(self):
        try:
            self.image("public/logo-icon.png", x=80, y=100, w=50, alpha=0.03)
        except:
            pass


pdf = OperiqPDF()
pdf.set_margin(20)

# --- Cover Page ---
pdf.add_page()
pdf.ln(40)
try: pdf.set_font("Inter", "B", 28)
except: pdf.set_font("Helvetica", "B", 28)
pdf.set_text_color(*pdf.accent)
pdf.cell(0, 15, "Operiq AI", align="C", new_x="LMARGIN", new_y="NEXT")
pdf.ln(5)
try: pdf.set_font("Inter", "", 18)
except: pdf.set_font("Helvetica", "", 18)
pdf.set_text_color(40, 40, 40)
pdf.cell(0, 10, "Workplace Productivity Assistant", align="C", new_x="LMARGIN", new_y="NEXT")
pdf.ln(10)
try: pdf.set_font("Inter", "", 11)
except: pdf.set_font("Helvetica", "", 11)
pdf.set_text_color(100, 100, 100)
pdf.cell(0, 8, "Technical Documentation & Architecture Guide", align="C", new_x="LMARGIN", new_y="NEXT")
pdf.cell(0, 8, "v2.0.0", align="C", new_x="LMARGIN", new_y="NEXT")
pdf.ln(20)
try:
    pdf.image("public/logo-icon.png", x=80, y=pdf.get_y(), w=50)
except:
    pass

# --- Section 1: Problem Statement ---
pdf.add_page()
pdf.section_title("1. Problem Statement")
pdf.body_text("Working professionals across industries spend a significant portion of their day on repetitive, time-consuming tasks: drafting emails, summarizing meetings, planning tasks, and researching topics. These activities, while necessary, divert attention from high-value strategic work and creative problem-solving.")
pdf.body_text("Studies show that knowledge workers can spend up to 60% of their time on administrative and communication tasks rather than core responsibilities. The cumulative effect is reduced productivity, delayed decision-making, and professional burnout.")
pdf.sub_heading("The Solution")
pdf.body_text("Operiq AI is an AI-driven workplace productivity platform designed to automate and accelerate these repetitive tasks. By leveraging large language models and intelligent automation, Operiq AI helps professionals reclaim their time and focus on what matters most.")

# --- Section 2: Solution Overview ---
pdf.add_page()
pdf.section_title("2. Solution Overview")
pdf.body_text("Operiq AI provides five core features that address real-world workplace productivity challenges:")
features = [
    ("Smart Email Generator", "Generate context-based professional emails with tone variations and audience adaptation."),
    ("Meeting Notes Summarizer", "Convert lengthy notes into concise summaries with key points, decisions, and action items."),
    ("AI Task Planner", "Generate structured daily or weekly plans with task prioritization and time optimization."),
    ("AI Research Assistant", "Summarize articles, reports, or topics with key insights and recommendations."),
    ("AI Chatbot Interface", "Interactive assistant for queries, multi-prompt conversations, and workplace assistance."),
]
for name, desc in features:
    pdf.sub_heading(name)
    pdf.body_text(desc)

# --- Section 3: System Architecture ---
pdf.add_page()
pdf.section_title("3. System Architecture")
pdf.body_text("Operiq AI is deployed on Netlify's global edge infrastructure, combining serverless functions with a real-time backend powered by Convex.")
pdf.sub_heading("Infrastructure Components")
pdf.bullet("Netlify Edge -- Global CDN with edge functions for request routing, authentication middleware, and security.")
pdf.bullet("Convex -- Real-time reactive backend providing ACID-compliant database operations, scheduled functions, and built-in authentication.")
pdf.bullet("AI Providers -- OpenAI-compatible gateway for text generation; ElevenLabs for speech; Hugging Face for image and video generation.")
pdf.bullet("External Services -- Resend for transactional email; DuckDuckGo for web search.")
pdf.sub_heading("Architecture Diagram")
try:
    pdf.image("docs/operiq-system-architecture.png", x=20, w=170)
except:
    pdf.body_text("(Architecture diagram available in source repository)")

# --- Section 4: Software Architecture ---
pdf.add_page()
pdf.section_title("4. Software Architecture")
pdf.sub_heading("Frontend")
pdf.body_text("React 19 with TanStack Start and TanStack Router for file-system routing. Tailwind CSS v4 with shadcn/ui components. Inter font family. Responsive mobile-first design.")
pdf.sub_heading("Backend")
pdf.body_text("Convex serverless backend organized into domain modules: schema.ts (database), users.ts (auth/profile), emailDrafts.ts (email generation), summaries.ts (meeting analysis), plans.ts (task planning), analyses.ts (research), billing.ts (subscriptions), sharedChats.ts (collaboration).")
pdf.sub_heading("State Management")
pdf.bullet("Server State -- Convex useQuery with real-time reactive updates.")
pdf.bullet("Client State -- React useState for ephemeral UI state.")
pdf.bullet("Auth State -- @convex-dev/auth with ConvexAuthProvider at root level.")

# --- Section 5: Prompt Engineering ---
pdf.add_page()
pdf.section_title("5. Prompt Engineering")
pdf.body_text("Each AI feature uses carefully crafted system prompts that define the model's role, output format, constraints, and quality standards. Prompts are version-controlled and testable.")
pdf.sub_heading("Prompt Structure")
pdf.bullet("System Instructions -- Define persona, output format, boundaries, and tone.")
pdf.bullet("Context Injection -- User-provided data (recipient, notes, material) clearly delineated.")
pdf.bullet("Output Guardrails -- Structured output formats, validation checks, disclaimers.")
pdf.sub_heading("Email Draft Prompt")
pdf.body_text("System: 'You are a professional email drafter for Operiq AI. Generate a well-structured email based on the provided context. Adhere strictly to the specified tone and audience. Do not fabricate information. Output only the email body in professional format.'")
pdf.body_text("User context includes: recipient, subject, tone (formal/informal/persuasive), audience (client/manager/team), and additional context notes.")
pdf.sub_heading("Meeting Summary Prompt")
pdf.body_text("System: 'You are an executive meeting summarizer. Extract key discussion points, decisions made, action items with assigned responsibilities and deadlines. Be concise but thorough. Use markdown formatting with clear sections.'")

# --- Section 6: Responsible AI ---
pdf.add_page()
pdf.section_title("6. Responsible AI")
pdf.body_text("Operiq AI implements comprehensive safeguards across all AI-powered features to ensure ethical and responsible use.")
pdf.bullet("Bias Mitigation -- Prompts include neutrality instructions; outputs monitored for fairness across demographics.")
pdf.bullet("Data Privacy -- AI providers configured to not use submitted data for model training. User data never shared with third parties.")
pdf.bullet("Disclaimers -- All generated outputs include a disclaimer: 'AI-generated content. Please review before use.'")
pdf.bullet("Validation -- Users are reminded to verify AI outputs before acting on them, especially for critical communications.")
pdf.bullet("Rate Limiting -- Usage limits prevent abuse; free tier limited to 50 AI requests per day.")
pdf.bullet("Transparency -- Clear labeling of AI-generated content throughout the platform.")

# --- Section 7: Evaluation Criteria ---
pdf.add_page()
pdf.section_title("7. Evaluation Criteria")
pdf.body_text("Operiq AI is evaluated across six criteria demonstrating both technical capability and real-world applicability:")
criteria = [
    ("Problem Relevance (20%)", "Addresses real workplace productivity challenges faced by professionals across industries."),
    ("Prompt Engineering (25%)", "Structured, tested, and refined prompts with clear system instructions, context injection, and output guardrails."),
    ("Functionality Accuracy (25%)", "AI-powered features with validation checks; streaming chat with tool-augmented agent mode."),
    ("Innovation (15%)", "Multi-agent ReAct loop, voice TTS/STT, image and video generation, shared chat collaboration."),
    ("Responsible AI (10%)", "Bias detection, privacy safeguards, disclaimers, rate limiting, transparent AI labeling."),
    ("Presentation (5%)", "Professional documentation with architecture diagrams, prompt samples, and evaluation alignment."),
]
for name, desc in criteria:
    pdf.sub_heading(name)
    pdf.body_text(desc)

# --- Section 8: Tools & Technologies ---
pdf.add_page()
pdf.section_title("8. Tools & Technologies")
pdf.body_text("The following tools and technologies power the Operiq AI platform:")
tools_data = [
    ("AI / ML", "OpenAI API, Hugging Face (FLUX, HunyuanVideo), ElevenLabs (TTS/STT)"),
    ("Frontend", "React 19, TanStack Start, TanStack Router, Tailwind CSS v4, shadcn/ui, lucide-react"),
    ("Backend", "Convex (real-time database, auth, file storage), TypeScript"),
    ("Infrastructure", "Netlify (CDN, Edge Functions, serverless), Vite, Bun"),
    ("External", "Resend (email delivery), DuckDuckGo (web search), Stripe (payments)"),
]
for cat, desc in tools_data:
    pdf.sub_heading(cat)
    pdf.body_text(desc)

# --- Section 9: Sample Prompts & Outputs ---
pdf.add_page()
pdf.section_title("9. Sample Prompts & Outputs")
pdf.sub_heading("Email Generation Example")
pdf.body_text("Input: Recipient: John (Manager), Subject: Project Update, Tone: Professional")
pdf.body_text("Output: A well-formatted email with subject line, greeting, status update paragraph, next steps, and closing signature. Includes action items with clear ownership and deadlines.")
pdf.sub_heading("Meeting Summary Example")
pdf.body_text("Input: 30-minute team sync notes covering Q2 roadmap, hiring pipeline, and sprint retrospective.")
pdf.body_text("Output: Structured summary with 'Key Decisions', 'Action Items' (with assignees and deadlines), and 'Discussion Highlights' sections. Extracts 5 action items from free-form notes.")

# --- Section 10: Challenges & Solutions ---
pdf.add_page()
pdf.section_title("10. Challenges & Solutions")
challenges = [
    ("SSR Authentication", "TanStack Start SSR required careful auth state handling. Solved with ConvexAuthProvider wrapping and AuthGate component for route protection."),
    ("AI Streaming Integration", "Integrating Vercel AI SDK streaming with custom tool system. Resolved using streamText with maxSteps for agent mode, matching useChat transport format."),
    ("Netlify Deployment", "Environment variables in Cloudflare Workers need request-time access. Created server-only config pattern with .server.ts suffix."),
    ("Multi-Provider Routing", "Supporting multiple AI providers (OpenAI, Anthropic, Hugging Face). Implemented unified provider interface with model name mapping."),
    ("Usage Tracking & Billing", "Real-time usage tracking without blocking requests. Fire-and-forget tracking mutations with period auto-reset."),
]
for name, desc in challenges:
    pdf.sub_heading(name)
    pdf.body_text(desc)

# Save
output_path = "docs/operiq-documentation.pdf"
pdf.output(output_path)
print(f"PDF generated: {output_path} ({pdf.pages_count} pages)")
