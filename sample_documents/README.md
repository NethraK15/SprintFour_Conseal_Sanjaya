# Sanjaya Verification Test Documents

This folder contains 5 detailed, multi-genre test documents specifically structured to evaluate Sanjaya's privacy detection, safe context retention, and interactive interrogation capabilities.

---

## 1. Mergers & Acquisitions Term Sheet (`01_Financial_M&A_Term_Sheet.txt`)
* **Genre:** Corporate Finance & Dealmaking
* **What to verify:**
  * **High monetary valuation ($145,000,000):** Try highlighting `$145,000,000` with your mouse and clicking **Ask Sanjaya Why**. Notice how Sanjaya explains financial figures vs contact PII.
  * **Safe / Kept Visible Highlights:** Dates (`October 15, 2026`) and Corporate Organizations (`Conseal Security Holdings`) should be certified as safe context (`REVEAL`) in green.
  * **Redacted PII:** Wire account numbers (`8849-2019-3382`), routing numbers, emails, and phone numbers.

---

## 2. Litigation Settlement Agreement (`02_Legal_ND_Settlement_Agreement.txt`)
* **Genre:** Legal & Litigation Dispute
* **What to verify:**
  * **Government PII:** Detects and flags Social Security Numbers (`SSN 219-48-9910`) and personal email addresses.
  * **Confidential Settlement Amount ($3,250,000):** Interrogate the settlement figure to see how Sanjaya evaluates non-disclosure agreement risks.

---

## 3. HIPAA Clinical Trial Report (`03_Healthcare_Patient_Clinical_Trial_Report.txt`)
* **Genre:** Medical Research & Healthcare
* **What to verify:**
  * **Patient Identifiers:** Automatically redacts patient names, dates of birth (`04/18/1984`), and Medical Record Numbers (`MRN: 994-821-003`).
  * **Hospital Context:** Keeps the institution name (`St. Jude Memorial Research Hospital`) and clinical study dates visible so medical researchers retain therapeutic context without violating HIPAA.

---

## 4. Internal Engineering Architecture Memo (`04_Tech_Engineering_Architecture_Memo.txt`)
* **Genre:** Proprietary Software Architecture & Infrastructure
* **What to verify:**
  * **Secret Keys & IPs:** Identifies production IP addresses (`192.168.10.45`) and AWS access keys (`AKIAIOSFODNN7EXAMPLE`).
  * **Trade Secrets:** Highlight internal codenames (`Project Titan-X` or `Algorithm Aegis-9`) with your mouse and use the 1-click **Keep Hidden** override inside the AI Courtroom.

---

## 5. Executive HR Compensation Schedule (`05_HR_Executive_Compensation_Review.txt`)
* **Genre:** Human Resources & Executive Payroll
* **What to verify:**
  * **Tax & Banking IDs:** Detects Indian Tax PAN (`PAN: ABCDE1234F`), UK Bank IBANs (`GB82WEST...`), and Social Security numbers.
  * **Bonus Allocations:** Interrogate individual bonus figures (`$180,000`) before running HR analytics through external AI models.
