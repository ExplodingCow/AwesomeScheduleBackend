**AwesomeSchedule for Asia Pacific University (Backend)**
----
  This is the documentation for the AwesomeSchedule Backend API. This returns the weekly schedule of a specific intake in a JSON format. I've decided to open source this for noobs like me.

* **URL**

  https://awesome-schedule.herokuapp.com/api/
  
* **Method:**
  
  `GET`
  
*  **How to query**

   - To obtain the schedule of the week for a specific intake
   
     `https://awesome-schedule.herokuapp.com/api/schedules/DATE_OF_MOMDAY_OF_WEEK/INTAKE_CODE` <br>
     
   - To obtain the list of intakes available
   
     `https://awesome-schedule.herokuapp.com/api/intakes/list`

* **Success Response:**
  
  *Schedule of the week for a specific intake*

  * **Code:** 200 <br />
    **Content:** 
    ```
    [{
        "DATE": "DAY DD-MM-YYYY",
        "INTAKE_CODE": "Your Intake Code Here",
        "TIME": "Time Class Starts - Time Class Ends", // Time is in 24 hour format eg. 08:30
        "CAMPUS": "NEW CAMPUS or TPM",
        "ROOM": "B-05-08",
        "MODULE_CODE": "BM012-4-0-EAP-T-2",
        "LECTURER": "AUDREY LINDA FERNANDO"
    }]
    ```
    
  *List of intakes*
   
   * **Code:** 200 <br/>
     **Content:**
     ```
     [
     "AFCF1702AS",
     "AFCF1702ICT",
     "AFCF1705AS",
     "AFCF1705ICT",
     "AFCF1709AS",
     "AFCF1709ICT",
     "AFCF1711AS",
     "AFCF1711ICT",
     "AFCF1801AS",
     "AFCF1801ICT",
     "APT1F1709BIT",
     "APT1F1709CYB",
     "APT1F1709FRC",
     ...
     ]
     ```
* **Error Response:**

  Most Common Errors:

  *Invalid Date*
  * **Code:** 404 <br />
    **Content:** `{ error : "Date not in database" }`

  OR
  
  *Invalid Intake Code*
  * **Code:** 404 <br />
    **Content:** `{ error : "Intake not found in database" }`

* **Sample Call:**
  
  Sample Request:<br>
  `https://awesome-schedule.herokuapp.com/api/schedules/2018-04-30/UCFF1804CT`
  
  Sample Response:
     ```
    [{
        "DATE": "MON 30-04-2018",
        "INTAKE_CODE": "UCFF1804CT",
        "TIME": "08:30 - 10:30",
        "CAMPUS": "NEW CAMPUS",
        "ROOM": "B-05-08",
        "MODULE_CODE": "BM012-4-0-EAP-T-2",
        "LECTURER": "AUDREY LINDA FERNANDO"
    },
    {
        "DATE": "MON 30-04-2018",
        "INTAKE_CODE": "UCFF1804CT",
        "TIME": "10:35 - 12:35",
        "CAMPUS": "NEW CAMPUS",
        "ROOM": "B-04-10",
        "MODULE_CODE": "BM012-4-0-EAP-T-3",
        "LECTURER": "AUDREY LINDA FERNANDO"
    },
    {
        "DATE": "WED 02-05-2018",
        "INTAKE_CODE": "UCFF1804CT",
        "TIME": "16:00 - 18:00",
        "CAMPUS": "NEW CAMPUS",
        "ROOM": "Tech Lab 4-03",
        "MODULE_CODE": "CT004-4-0-EWA-LAB-2",
        "LECTURER": "MARY DIANA STEPHEN PAULRAJ"
    },
    {
        "DATE": "THU 03-05-2018",
        "INTAKE_CODE": "UCFF1804CT",
        "TIME": "08:30 - 10:30",
        "CAMPUS": "NEW CAMPUS",
        "ROOM": "B-04-10",
        "MODULE_CODE": "BM002-4-0-COS-T-1",
        "LECTURER": "DR. SARVINDER KAUR SANDHU"
    },
    ...
    ]
    ```

* **Notes:**

  If you believe there can be improvements, feel free to submit a pull request. <br>
  Do not hesitate to email <a href="mailto:TP050920@mail.apu.edu.my">Victor</a></br>
  I'll ignore your emails if you send any questions about this project to my other emails.
