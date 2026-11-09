# Phishing & Social Engineering Defensive Training Scenarios

This document outlines the scenario library for the phishing defense training platform. Each scenario includes realistic metadata, message content, delivery mechanism, and the underlying indicators distinguishing legitimate traffic from social engineering attacks.

---

## Scenario 1: Scam Email (Executive Impersonation / Urgent Wire Transfer)
* **Type:** Email (`emails.json`)
* **Classification:** Scam / Phishing
* **Sender:** `ce0-office@corp-secure-auth.com` (Lookalike domain)
* **Subject:** URGENT: Confidential Vendor Settlement Required Today
* **Body:**
  > Team, 
  > 
  > I am currently locked in urgent board negotiations and cannot take calls. We need to settle an emergency invoice with our primary hardware vendor immediately to avoid supply chain termination. 
  > 
  > Please wire $48,500 to the escrow account details provided in the secure portal link below within the next 2 hours. Do not discuss this with local finance yet to maintain confidentiality.
  > 
  > [Access Secure Escrow Portal & Authorize Payment]
* **Indicators of Compromise / Tell-Tails:**
  * **External Lookalike Domain:** Uses a typo-squatted domain (`corp-secure-auth.com`) rather than the corporate domain.
  * **Urgency & Secrecy:** Pressures the target to bypass standard multi-person financial controls and keep the request secret from colleagues.
  * **Generic Call to Action:** Generic anchor text pointing to an external credential-harvesting or credential-stuffing landing page.

---

## Scenario 2: Scam Email (IT Service Desk Credential Harvest)
* **Type:** Email (`emails.json`)
* **Classification:** Scam / Phishing
* **Sender:** `it-support-alerts@microsoft-defender-auth.net`
* **Subject:** Action Required: Mandatory Multi-Factor Authentication (MFA) Re-Registration
* **Body:**
  > Dear Employee,
  > 
  > As part of our enterprise security hardening schedule following recent threat intelligence bulletins, all employees must re-verify their authentication tokens within 24 hours. Failure to update will result in account suspension and loss of email access.
  > 
  > Click below to sync your hardware token or authenticator app:
  > 
  > [Verify & Sync Authentication Token Now]
* **Indicators of Compromise / Tell-Tails:**
  * **Suspicious Sender Infrastructure:** Hosted on an unrelated external domain (`microsoft-defender-auth.net`).
  * **Coercive Deadlines:** Threatens account lockout to trigger panic and quick compliance.
  * **Credential Harvesting Link:** Directs users away from the legitimate internal IDP login portal to an external harvesting clone.

---

## Scenario 3: Scam Email (Software License Expiry / Malware Dropper)
* **Type:** Email (`emails.json`)
* **Classification:** Scam / Malware Dropper
* **Sender:** `billing@adobe-license-renewal-portal.com`
* **Subject:** Critical Notice: Enterprise Software Subscription Expiring Today
* **Body:**
  > Hello Administrator,
  > 
  > Your department's annual enterprise software license agreement has expired due to a billing failure. To prevent disruption to your design and documentation workflows, please review and execute the attached updated licensing agreement script.
  > 
  > Attachment: `Enterprise_License_Agreement_2026_Update.iso`
* **Indicators of Compromise / Tell-Tails:**
  * **Malicious File Attachment:** Uses an ISO or archived executable container designed to bypass email gateway macro inspection and drop remote-access trojans or infostealer payloads.
  * **Urgently Framed Business Disruption:** Leverages common enterprise software names to induce quick downloading without security scrutiny.

---

## Scenario 4: Genuine Email (Standard HR Policy Update)
* **Type:** Email (`emails.json`)
* **Classification:** Genuine / Safe
* **Sender:** `hr-announcements@internal.yourcompany.com`
* **Subject:** Updated Remote Work Expense Guidelines for Q4
* **Body:**
  > Hi Everyone,
  > 
  > Please review the updated Q4 remote work and office equipment expense policy attached to this email. The internal finance wiki has also been updated with the new submission codes. If you have any questions, reach out via our internal Slack channel `#hr-support`.
  > 
  > Attachment: `Q4_Expense_Guidelines_2026.pdf`
* **Why It's Genuine:**
  * **Internal Domain Alignment:** Sent entirely from the verified internal corporate domain (`internal.yourcompany.com`).
  * **Standard Document Format:** Uses a safe, non-executable document format (`.pdf`) rather than scripts or ISOs.
  * **Alternative Contact Channels:** Directs inquiries to an official internal communication channel rather than demanding immediate external action.

---

## Scenario 5: Genuine Email (IT Infrastructure Maintenance Notification)
* **Type:** Email (`emails.json`)
* **Classification:** Genuine / Safe
* **Sender:** `noc-ops@internal.yourcompany.com`
* **Subject:** Scheduled Maintenance: VPN Gateway Upgrades This Sunday
* **Body:**
  > Team,
  > 
  > Our Network Operations Center will perform scheduled maintenance on our primary VPN gateways this Sunday from 02:00 to 04:00 EST. Brief service interruptions may occur. No user action or password reset is required.
  > 
  > Check our status page at `status.internal.net` for live updates.
* **Why It's Genuine:**
  * **No Credential Requests:** Explicitly states that **no user action, credential entry, or password reset is required**.
  * **Informational Tone:** Standard operational notification providing advance notice through internal infrastructure channels.

---

## Scenario 6: Genuine Email (Automated Threat Intelligence Briefing)
* **Type:** Email (`emails.json`)
* **Classification:** Genuine / Safe
* **Sender:** `secops-automation@internal.yourcompany.com`
* **Subject:** Daily Automated Threat Intelligence & Ransomware Briefing
* **Body:**
  > Automated Security Operations Briefing:
  > 
  > Today's cross-sector briefing covering edge device zero-days (such as Zyxel CVE-2026-107441) and container OpenSSH audits has been successfully generated and synchronized to your secure Google Drive folder and master CSV log.
  > 
  > [View Shared Google Drive Folder]
* **Why It's Genuine:**
  * **Contextual Consistency:** Aligned with internal engineering workflows, utilizing trusted internal automation pipelines and verified cloud storage endpoints.

---

## Scenario 7: Scam Text / SMS (Package Delivery Phishing)
* **Type:** Text (`texts.json`)
* **Classification:** Scam / Smishing
* **Sender:** `+1 (800) 492-9182` (Unknown mobile / shortcode gateway)
* **Body:**
  > Canada Post: Your package could not be delivered due to an incorrect street address format. To schedule redelivery, please confirm your details and pay the $1.25 handling fee immediately: https://canadapost-parcel-update-2026.com/track
* **Indicators of Compromise / Tell-Tails:**
  * **Unsolicited Delivery Notice:** Targets common consumer behaviors with low-cost lures ($1.25 fee) to harvest credit card data and billing details.
  * **Typosquatted URL:** Uses a non-official external domain imitating a postal carrier.

---

## Scenario 8: Genuine Text / SMS (Corporate IT 2FA Verification)
* **Type:** Text (`texts.json`)
* **Classification:** Genuine / Safe
* **Sender:** `CorporateID` (Verified A2P SMS shortcode)
* **Body:**
  > Your corporate VPN verification code is 849204. Valid for 5 minutes. Do not share this code with anyone, including IT support.
* **Why It's Genuine:**
  * **Registered Shortcode:** Sent via an established, locked Application-to-Person (A2P) enterprise SMS sender ID.
  * **Security Reminder:** Explicitly warns the recipient never to share the code, reflecting standard organizational security policies.

---

## Scenario 9: Scam Chat (Impostor IT Support via Collaboration App)
* **Type:** Chat (`chats.json`)
* **Classification:** Scam / Social Engineering
* **Sender:** `Alex_Morgan_IT_Helpdesk` (External guest account or compromised peer account)
* **Body:**
  > **Alex_Morgan_IT_Helpdesk [External Guest]:** Hello! We noticed unusual login attempts on your enterprise account from an overseas IP address. Please click this quick support link and authenticate your session so we can prevent your account from being locked: `https://helpdesk-auth-verify.internal-support.net/login`
* **Indicators of Compromise / Tell-Tails:**
  * **External Guest Badge:** Appears in corporate chat channels with an external guest or unverified badge.
  * **False Urgency:** Uses fear of account lockout to rush the user into clicking an unauthorized external phishing link.

---

## Scenario 10: Genuine Chat (Internal Team Collaboration)
* **Type:** Chat (`chats.json`)
* **Classification:** Genuine / Safe
* **Sender:** `Sarah Jenkins (DevOps Lead)`
* **Body:**
  > **Sarah Jenkins (DevOps Lead):** Hey team, just pushed the fix for the staging cluster timeout issue to the `feature/fix-auth-timeout` branch. Can someone take a quick look at the PR when you have a moment? No rush, review tomorrow morning is fine.
* **Why It's Genuine:**
  * **Contextual Work Discussion:** References internal code branches, peer code review processes, and normal asynchronous engineering workflows without any suspicious links, urgency, or credential requests.
