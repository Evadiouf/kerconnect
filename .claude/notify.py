"""
Hawoly — Système de notification email
Envoie un rapport de fin de phase à contact@naratechvision.com
Usage : python notify.py --phase 1 --resume "..." --tests "..." --next "..."
"""

import smtplib
import argparse
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime

# Config (chargée depuis .env.hawoly)
SENDER    = "demehawoly@gmail.com"
PASSWORD  = "fwxy agdx lvwb dozm"
RECIPIENT = "contact@naratechvision.com"

PHASES = {
    1: "Fondations",
    2: "Authentification",
    3: "Pages publiques",
    4: "Espace bailleur",
    5: "Espace client",
    6: "Paiements",
    7: "Espace admin",
    8: "Finalisation",
}

def send_notification(phase: int, resume: str, tests: str, points: str, next_phase: str):
    phase_name = PHASES.get(phase, f"Phase {phase}")
    next_name  = PHASES.get(phase + 1, "Projet terminé")
    date_str   = datetime.now().strftime("%d/%m/%Y à %H:%M")

    subject = f"KerConnect — Phase {phase} ({phase_name}) terminée ✓"

    body = f"""
Bonjour,

Hawoly vous informe que la Phase {phase} du projet KerConnect est terminée.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 PHASE {phase} — {phase_name.upper()}
 Terminée le : {date_str}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CE QUI A ETE CONSTRUIT :
{resume}

TESTS EFFECTUES :
{tests}

POINTS D'ATTENTION :
{points if points else "Aucun point particulier."}

PROCHAINE ETAPE :
Phase {phase + 1} — {next_name}
{next_phase}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Hawoly | Agent IA KerConnect
Naratechvision © 2026
"""

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"]    = f"Hawoly KerConnect <{SENDER}>"
    msg["To"]      = RECIPIENT

    msg.attach(MIMEText(body, "plain", "utf-8"))

    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(SENDER, PASSWORD)
            server.sendmail(SENDER, RECIPIENT, msg.as_string())
        print(f"Notification Phase {phase} envoyée à {RECIPIENT}")
        return True
    except Exception as e:
        print(f"Erreur envoi email : {e}")
        return False


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Notification fin de phase KerConnect")
    parser.add_argument("--phase",  type=int, required=True, help="Numéro de phase (1-8)")
    parser.add_argument("--resume", type=str, default="", help="Résumé de ce qui a été construit")
    parser.add_argument("--tests",  type=str, default="", help="Tests effectués")
    parser.add_argument("--points", type=str, default="", help="Points d'attention")
    parser.add_argument("--next",   type=str, default="", help="Description prochaine phase")
    args = parser.parse_args()

    send_notification(args.phase, args.resume, args.tests, args.points, args.next)
