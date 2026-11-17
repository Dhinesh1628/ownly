import os
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    HRFlowable,
    KeepTogether
)

def build_pdf(filename):
    doc = SimpleDocTemplate(
        filename,
        pagesize=letter,
        rightMargin=40,
        leftMargin=40,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()

    # Custom styles
    # Colors
    c_primary = colors.HexColor('#0d9488')      # Teal 600
    c_dark = colors.HexColor('#0f172a')         # Slate 900
    c_subtext = colors.HexColor('#475569')      # Slate 600
    c_action_bg = colors.HexColor('#f0fdfa')    # Teal 50
    c_action_border = colors.HexColor('#99f6e4')# Teal 200
    c_card_bg = colors.HexColor('#f8fafc')      # Slate 50
    c_card_border = colors.HexColor('#e2e8f0')  # Slate 200

    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        textColor=c_dark,
        spaceAfter=3
    )

    tagline_style = ParagraphStyle(
        'DocTagline',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=15,
        textColor=c_primary,
        spaceAfter=12
    )

    section_header_style = ParagraphStyle(
        'SectionHeader',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=c_dark,
        spaceBefore=0,
        spaceAfter=4
    )

    time_badge_style = ParagraphStyle(
        'TimeBadge',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=12,
        textColor=colors.HexColor('#0f766e'),
        alignment=2 # Right
    )

    where_style = ParagraphStyle(
        'WhereText',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=9,
        leading=13,
        textColor=colors.HexColor('#0e7490')
    )

    action_style = ParagraphStyle(
        'ActionText',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=13,
        textColor=colors.HexColor('#0f766e')
    )

    speech_style = ParagraphStyle(
        'SpeechText',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=14.5,
        textColor=c_dark
    )

    tip_style = ParagraphStyle(
        'TipText',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=12,
        textColor=colors.HexColor('#334155')
    )

    story = []

    # Title & Subtitle Banner
    story.append(Paragraph("Ownly — 3-Minute Presentation Speech", title_style))
    story.append(Paragraph("Tagline: Every email has an owner. | Complete Step-by-Step Demo Guide", tagline_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=c_primary, spaceBefore=0, spaceAfter=10))

    # Helper function for sections
    def add_section(time_range, title, where_to_look, what_to_click, speech_text):
        # Header Table: Title on left, Time on right
        header_data = [
            [
                Paragraph(f"<b>{title}</b>", section_header_style),
                Paragraph(f"<b>{time_range}</b>", time_badge_style)
            ]
        ]
        t_header = Table(header_data, colWidths=[410, 122])
        t_header.setStyle(TableStyle([
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ('BOTTOMPADDING', (0,0), (-1,-1), 2),
            ('TOPPADDING', (0,0), (-1,-1), 0),
            ('LEFTPADDING', (0,0), (-1,-1), 0),
            ('RIGHTPADDING', (0,0), (-1,-1), 0),
        ]))

        # Location and Action Box
        guide_data = [
            [
                Paragraph(f"<b>WHERE ON SCREEN:</b> {where_to_look}", where_style)
            ],
            [
                Paragraph(f"<b>WHAT TO DO:</b> {what_to_click}", action_style)
            ]
        ]
        t_guide = Table(guide_data, colWidths=[532])
        t_guide.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), c_action_bg),
            ('BOX', (0,0), (-1,-1), 0.75, c_action_border),
            ('TOPPADDING', (0,0), (-1,-1), 4),
            ('BOTTOMPADDING', (0,0), (-1,-1), 4),
            ('LEFTPADDING', (0,0), (-1,-1), 8),
            ('RIGHTPADDING', (0,0), (-1,-1), 8),
        ]))

        # Speech Box
        speech_data = [
            [
                Paragraph(f"<b>WHAT TO SAY (In Simple English):</b><br/>{speech_text}", speech_style)
            ]
        ]
        t_speech = Table(speech_data, colWidths=[532])
        t_speech.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), c_card_bg),
            ('BOX', (0,0), (-1,-1), 0.75, c_card_border),
            ('TOPPADDING', (0,0), (-1,-1), 6),
            ('BOTTOMPADDING', (0,0), (-1,-1), 6),
            ('LEFTPADDING', (0,0), (-1,-1), 8),
            ('RIGHTPADDING', (0,0), (-1,-1), 8),
        ]))

        section_elements = [
            t_header,
            Spacer(1, 3),
            t_guide,
            Spacer(1, 3),
            t_speech,
            Spacer(1, 9)
        ]
        story.append(KeepTogether(section_elements))

    # SECTION 1
    add_section(
        time_range="0:00 - 0:35 (35 sec)",
        title="Part 1: The Problem & The Solution",
        where_to_look="Login Page (http://localhost:5175/login)",
        what_to_click="Show the logo and 'Ownly' title in the center card. Point to the two demo buttons below the divider.",
        speech_text=(
            "\"Hello everyone. Today, I am happy to present <b>Ownly</b>.<br/>"
            "Our core motto is simple: <b>'Every email has an owner.'</b><br/><br/>"
            "In most companies, busy bosses and their assistants receive hundreds of emails every week. "
            "Things get messy fast. Both people ask each other: <i>'Did you answer this email? Whose turn is it to reply?'</i> "
            "Important client messages get forgotten, and work gets repeated.<br/><br/>"
            "Ownly fixes this problem directly. Every single email is automatically given a clear owner: "
            "either the <b>Assistant</b>, the <b>Client</b>, or <b>No reply needed</b>. "
            "To make this easy to test, we have two 1-click views right here: <b>Assistant view</b> and <b>Client view</b>.\""
        )
    )

    # SECTION 2
    add_section(
        time_range="0:35 - 1:15 (40 sec)",
        title="Part 2: Workspace Overview & Smart Navigation",
        where_to_look="Overview Dashboard (http://localhost:5175/overview)",
        what_to_click="Click 'Assistant view' on login. Point across the top 4 cards, then point to the left sidebar.",
        speech_text=(
            "\"Now, let's step in as the assistant. Here is our <b>Workspace Overview</b>.<br/><br/>"
            "Look at the four large cards at the top:<br/>"
            "• <b>Needs your reply:</b> Emails that the assistant must answer.<br/>"
            "• <b>Client to reply:</b> High-priority emails that only the boss can answer.<br/>"
            "• <b>Awaiting response:</b> Emails where we already replied, and we are waiting on them.<br/>"
            "• <b>Needs review (in amber):</b> Emails where the AI is not 100% sure, so a human can double-check.<br/><br/>"
            "Below the cards, we have our <b>'Due today'</b> list and <b>'Upcoming meetings'</b>. "
            "On the left sidebar, everything is grouped cleanly under <b>'Who replies'</b> and <b>'Follow-ups'</b>. "
            "In one glance, the assistant knows exactly what needs attention today.\""
        )
    )

    # SECTION 3
    add_section(
        time_range="1:15 - 2:05 (50 sec)",
        title="Part 3: 3-Pane Inbox & Smart AI Summary",
        where_to_look="Inbox Page (Click 'Open inbox' or 'Assistant to reply')",
        what_to_click="Click any email thread in the middle list. Point to the AI summary box at the top of the right pane.",
        speech_text=(
            "\"Next, let's open the <b>3-Pane Inbox</b>.<br/><br/>"
            "In the middle list, each email has a clean 3-line format: the sender, the subject, and a short preview. "
            "Unread emails have a clean teal dot, and urgent items have priority badges.<br/><br/>"
            "Now look at the right pane. Instead of reading through a long, confusing email chain, look at this top <b>AI Summary Box</b>:<br/>"
            "1. <b>Responsibility badge:</b> Shows who owns it with an AI confidence score.<br/>"
            "2. <b>Why:</b> Gives a one-line explanation why this person was chosen.<br/>"
            "3. <b>Summary:</b> Explains the whole email in two short sentences.<br/>"
            "4. <b>Due date:</b> Shows the deadline automatically.<br/><br/>"
            "Older messages are neatly tucked away, and at the bottom, there is a <b>'Draft with AI'</b> button that writes a polite, professional reply in seconds.\""
        )
    )

    # SECTION 4
    add_section(
        time_range="2:05 - 2:40 (35 sec)",
        title="Part 4: The Client Portal (Executive View)",
        where_to_look="Client Portal (http://localhost:5175/client)",
        what_to_click="Click user avatar -> switch to Client or open /client. Point to 'Needs your reply' and the action buttons.",
        speech_text=(
            "\"Now, let's see what the boss sees. Executives don't want a complicated inbox. They only want to see what needs their personal answer. This is the <b>Client Portal</b>.<br/><br/>"
            "The screen is simply titled <b>'Needs your reply'</b> with the note: <i>'Your assistant sees any changes you make here.'</i><br/>"
            "Emails are automatically grouped by deadline: <b>'Due today'</b>, <b>'This week'</b>, and <b>'Later'</b>.<br/><br/>"
            "The client has two fast buttons:<br/>"
            "• <b>Mark as handled:</b> Clears the email immediately, with an undo popup if clicked by mistake.<br/>"
            "• <b>Ask assistant to take over:</b> Lets the executive pass it to the assistant with an optional quick note.<br/>"
            "Everything updates in real-time on both sides—no extra phone calls or chat messages needed.\""
        )
    )

    # SECTION 5
    add_section(
        time_range="2:40 - 3:00 (20 sec)",
        title="Part 5: Search, Theme & Conclusion",
        where_to_look="Top Navigation Bar (Search bar, theme toggle, avatar)",
        what_to_click="Click the search bar to show live suggestions, toggle the Sun/Moon icon, and wrap up.",
        speech_text=(
            "\"Finally, Ownly includes powerful quality-of-life tools:<br/>"
            "• <b>Search bar:</b> Type anything or press Ctrl+K to get instant live suggestions.<br/>"
            "• <b>Dark & Light theme:</b> Click the sun or moon icon in the top right to switch modes instantly.<br/>"
            "• <b>Connected accounts:</b> In the avatar menu, users can connect simulated Gmail and Outlook accounts.<br/><br/>"
            "To wrap up: <b>Ownly</b> takes the chaos out of daily email. It makes sure no email is forgotten, and every email has an owner.<br/>"
            "Thank you very much, and I welcome any questions!\""
        )
    )

    # Presentation Tips Box at the end
    tips_data = [
        [
            Paragraph(
                "<b>PRO-TIPS FOR PRESENTING:</b><br/>"
                "• <b>Speaking Speed:</b> Speak at a calm, conversational speed. Do not rush.<br/>"
                "• <b>When Clicking:</b> Click the button FIRST, let the screen appear, then start speaking about that screen.<br/>"
                "• <b>Key Catchphrase:</b> Emphasize the line: <i>'Every email has an owner'</i> at the start and at the end.",
                tip_style
            )
        ]
    ]
    t_tips = Table(tips_data, colWidths=[532])
    t_tips.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#f1f5f9')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#cbd5e1')),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(t_tips)

    doc.build(story)

if __name__ == "__main__":
    out_dir = r"C:\Users\dines\.gemini\antigravity\scratch\personal-assistant"
    out_path = os.path.join(out_dir, "Ownly_Presentation_Speech.pdf")
    build_pdf(out_path)
    print(f"Generated: {out_path}")
