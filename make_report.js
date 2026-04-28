const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, HeadingLevel, BorderStyle, WidthType,
  ShadingType, VerticalAlign, PageNumber, LevelFormat, PageBreak,
  TabStopType, TabStopPosition
} = require('docx');
const fs = require('fs');
const path = require('path');

const border = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const borders = { top: border, bottom: border, left: border, right: border };
const noBorder = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const noBorders = { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder };

const ORANGE = "E67E22";
const DARK = "1A1A2E";
const GRAY = "F2F2F2";
const HEADER_BG = "2C3E50";

function h(text, level = HeadingLevel.HEADING_1) {
  const sizes = { [HeadingLevel.HEADING_1]: 28, [HeadingLevel.HEADING_2]: 24 };
  return new Paragraph({
    heading: level,
    spacing: { before: 240, after: 120 },
    children: [new TextRun({ text, bold: true, size: sizes[level] || 24, color: DARK, font: "Arial" })]
  });
}

function p(text, opts = {}) {
  return new Paragraph({
    alignment: opts.center ? AlignmentType.CENTER : AlignmentType.JUSTIFIED,
    spacing: { before: 60, after: 100 },
    children: [new TextRun({ text, size: 22, font: "Arial", color: "333333", ...opts.run })]
  });
}

function bullet(text) {
  return new Paragraph({
    numbering: { reference: "bullets", level: 0 },
    spacing: { before: 40, after: 40 },
    children: [new TextRun({ text, size: 22, font: "Arial", color: "333333" })]
  });
}

function numbered(text) {
  return new Paragraph({
    numbering: { reference: "numbers", level: 0 },
    spacing: { before: 40, after: 40 },
    children: [new TextRun({ text, size: 22, font: "Arial", color: "333333" })]
  });
}

function gap(n = 1) {
  return Array.from({ length: n }, () => new Paragraph({ children: [new TextRun("")], spacing: { before: 0, after: 60 } }));
}

function sectionTitle(text) {
  return new Paragraph({
    spacing: { before: 300, after: 140 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: ORANGE, space: 4 } },
    children: [
      new TextRun({ text, bold: true, size: 26, color: DARK, font: "Arial" })
    ]
  });
}

function codeBlock(lines) {
  return lines.map(line =>
    new Paragraph({
      spacing: { before: 20, after: 20 },
      indent: { left: 360 },
      shading: { fill: "1E1E1E", type: ShadingType.CLEAR },
      children: [new TextRun({ text: line, size: 18, font: "Courier New", color: "00FF7F" })]
    })
  );
}

function flowDiagram() {
  const steps = [
    "Log Source (Application/Server)",
    "↓",
    "CloudWatch Log Group",
    "↓",
    "Metric Filter (Pattern Detection)",
    "↓",
    "CloudWatch Metric (ErrorCount)",
    "↓",
    "CloudWatch Alarm",
    "↓",
    "SNS Notification (Email Alert)"
  ];
  return steps.map((s, i) => new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 20, after: 20 },
    shading: s === "↓" ? undefined : { fill: i === 0 ? "2C3E50" : "ECF0F1", type: ShadingType.CLEAR },
    children: [new TextRun({
      text: s,
      size: s === "↓" ? 28 : 22,
      bold: s !== "↓",
      font: "Arial",
      color: i === 0 ? "FFFFFF" : (s === "↓" ? ORANGE : DARK)
    })]
  }));
}

function apiTable() {
  const rows = [
    ["API / Operation", "Purpose"],
    ["PutLogEvents", "Sends logs to CloudWatch Log Stream"],
    ["CreateLogGroup", "Creates centralized log storage group"],
    ["CreateLogStream", "Creates a log stream within a log group"],
    ["FilterLogEvents", "Retrieves filtered/searched log events"],
    ["PutMetricAlarm", "Creates CloudWatch alarms on metrics"],
    ["Publish (SNS)", "Sends email/SMS notifications via SNS"],
  ];
  return new Table({
    width: { size: 9026, type: WidthType.DXA },
    columnWidths: [3500, 5526],
    rows: rows.map((row, ri) =>
      new TableRow({
        children: row.map((cell, ci) =>
          new TableCell({
            borders,
            width: { size: ci === 0 ? 3500 : 5526, type: WidthType.DXA },
            shading: { fill: ri === 0 ? "2C3E50" : (ri % 2 === 0 ? "F2F2F2" : "FFFFFF"), type: ShadingType.CLEAR },
            margins: { top: 80, bottom: 80, left: 160, right: 160 },
            children: [new Paragraph({
              children: [new TextRun({
                text: cell, size: 20, bold: ri === 0, font: "Arial",
                color: ri === 0 ? "FFFFFF" : "333333"
              })]
            })]
          })
        )
      })
    )
  });
}

const doc = new Document({
  numbering: {
    config: [
      {
        reference: "bullets",
        levels: [{
          level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } }
        }]
      },
      {
        reference: "numbers",
        levels: [{
          level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } }
        }]
      }
    ]
  },
  styles: {
    default: { document: { run: { font: "Arial", size: 22 } } },
    paragraphStyles: [
      {
        id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 28, bold: true, font: "Arial", color: DARK },
        paragraph: { spacing: { before: 240, after: 120 }, outlineLevel: 0 }
      },
      {
        id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 24, bold: true, font: "Arial", color: DARK },
        paragraph: { spacing: { before: 180, after: 100 }, outlineLevel: 1 }
      }
    ]
  },
  sections: [
    // ── COVER PAGE ──────────────────────────────────────────────────────────
    {
      properties: {
        page: {
          size: { width: 11906, height: 16838 },
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
        }
      },
      children: [
        // College name box
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 200, after: 60 },
          border: {
            top: { style: BorderStyle.SINGLE, size: 6, color: DARK },
            bottom: { style: BorderStyle.SINGLE, size: 6, color: DARK },
            left: { style: BorderStyle.SINGLE, size: 6, color: DARK },
            right: { style: BorderStyle.SINGLE, size: 6, color: DARK },
          },
          children: [
            new TextRun({ text: "Maharshi Karve Stree Shikshan Samstha's", size: 18, font: "Arial", color: DARK, break: 0 }),
          ]
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 0, after: 0 },
          border: {
            left: { style: BorderStyle.SINGLE, size: 6, color: DARK },
            right: { style: BorderStyle.SINGLE, size: 6, color: DARK },
          },
          children: [new TextRun({ text: "Cummins College of Engineering for Women, Pune", size: 22, bold: true, font: "Arial", color: DARK })]
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 0, after: 0 },
          border: {
            left: { style: BorderStyle.SINGLE, size: 6, color: DARK },
            right: { style: BorderStyle.SINGLE, size: 6, color: DARK },
          },
          children: [new TextRun({ text: "(An autonomous Institute affiliated to Savitribai Phule Pune University)", size: 17, font: "Arial", color: "555555", italics: true })]
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 40, after: 200 },
          border: {
            bottom: { style: BorderStyle.SINGLE, size: 6, color: DARK },
            left: { style: BorderStyle.SINGLE, size: 6, color: DARK },
            right: { style: BorderStyle.SINGLE, size: 6, color: DARK },
          },
          children: [new TextRun({ text: "Department of Computer Engineering", size: 22, bold: true, font: "Arial", color: DARK })]
        }),

        ...gap(2),

        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 400, after: 200 },
          children: [new TextRun({ text: "Cloud Computing Laboratory", size: 40, bold: true, font: "Arial", color: DARK })]
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 0, after: 400 },
          children: [new TextRun({ text: "(2026-27 Sem-II)", size: 36, bold: true, font: "Arial", color: DARK })]
        }),

        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 200, after: 400 },
          children: [new TextRun({ text: "REPORT FOR OPEN ENDED ASSIGNMENT", size: 26, bold: false, font: "Arial", color: "444444" })]
        }),

        ...gap(2),

        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 400, after: 100 },
          children: [new TextRun({ text: "Group Members:", size: 24, bold: true, font: "Arial", color: DARK })]
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 60, after: 60 },
          children: [new TextRun({ text: "Anushka Mamane (UCE2023441)", size: 24, bold: true, font: "Arial", color: DARK })]
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 60, after: 300 },
          children: [new TextRun({ text: "Siddhani Magar (UCE2023439)", size: 24, bold: true, font: "Arial", color: DARK })]
        }),

        ...gap(3),

        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 200, after: 60 },
          children: [new TextRun({ text: "Project Title:", size: 24, bold: true, font: "Arial", color: DARK })]
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 60, after: 200 },
          children: [new TextRun({ text: "Cloud Task Manager using React and Firebase", size: 22, font: "Arial", color: "444444" })]
        }),
      ]
    },

    // ── CONTENT ─────────────────────────────────────────────────────────────
    {
      properties: {
        page: {
          size: { width: 11906, height: 16838 },
          margin: { top: 1080, right: 1080, bottom: 1080, left: 1260 }
        }
      },
      headers: {
        default: new Header({
          children: [
            new Paragraph({
              spacing: { before: 0, after: 80 },
              border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: ORANGE, space: 4 } },
              children: [
                new TextRun({ text: "Cloud Computing Laboratory | Cloud Task Manager", size: 18, font: "Arial", color: "888888" }),
                new TextRun({ text: "   |   Anushka Mamane & Siddhani Magar", size: 18, font: "Arial", color: "AAAAAA" }),
              ]
            })
          ]
        })
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              spacing: { before: 80, after: 0 },
              border: { top: { style: BorderStyle.SINGLE, size: 4, color: ORANGE, space: 4 } },
              tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
              children: [
                new TextRun({ text: "Cummins College of Engineering for Women, Pune", size: 16, font: "Arial", color: "AAAAAA" }),
                new TextRun({ text: "\tPage ", size: 16, font: "Arial", color: "888888" }),
                // FIX: PageNumber is not a constructor — use children array with PageNumber.CURRENT
                new TextRun({ children: [PageNumber.CURRENT], size: 16, font: "Arial", color: "888888" }),
              ]
            })
          ]
        })
      },
      children: [

        // 1. ABSTRACT
        sectionTitle("1. Abstract"),
        p("This project presents a cloud-based Task Manager application designed for real-time task creation, management, and synchronization using modern web technologies. The system allows users to add, edit, delete, and track tasks from any device. Using React for the frontend and Firebase as the cloud backend, the application provides authentication via Firebase Auth (Email/Password and Google OAuth), persistent cloud storage via Firestore, and real-time updates using Firestore's onSnapshot listener. This solution eliminates the need for a custom backend server, ensures seamless cross-device sync, and delivers a scalable, serverless architecture suitable for modern distributed environments."),
        ...gap(),

        // 2. INTRODUCTION
        sectionTitle("2. Introduction"),
        p("Traditional task management tools store data locally, which limits accessibility and prevents real-time collaboration. With the growing adoption of cloud computing, there is a need for web-based task managers that are accessible from anywhere and automatically synchronized across devices."),
        ...gap(1),
        p("This project addresses these challenges by leveraging Firebase — a Backend-as-a-Service (BaaS) cloud platform by Google — to:"),
        bullet("Authenticate users securely without building a custom backend"),
        bullet("Store and retrieve task data from a cloud NoSQL database (Firestore)"),
        bullet("Enable real-time synchronization across all connected clients"),
        bullet("Provide a responsive, interactive UI built with React"),
        ...gap(),

        // 3. SYSTEM ARCHITECTURE
        sectionTitle("3. System Architecture"),
        p("The architecture of the Cloud Task Manager is fully serverless. All backend services — authentication, database, and hosting — are provided by Firebase (Google Cloud)."),
        ...gap(1),
        h("3.1 Architecture Flow", HeadingLevel.HEADING_2),
        ...flowDiagram(),
        ...gap(1),

        h("3.2 Components Used", HeadingLevel.HEADING_2),

        new Paragraph({
          spacing: { before: 120, after: 60 },
          children: [new TextRun({ text: "1. React (Frontend Layer)", bold: true, size: 22, font: "Arial", color: DARK })]
        }),
        bullet("Component-based UI with useState and useEffect hooks"),
        bullet("Real-time UI updates triggered by Firestore snapshot listener"),
        bullet("Handles auth forms, task list, task form, and task item components"),

        new Paragraph({
          spacing: { before: 120, after: 60 },
          children: [new TextRun({ text: "2. Firebase Authentication", bold: true, size: 22, font: "Arial", color: DARK })]
        }),
        bullet("Email/Password login and signup"),
        bullet("Google OAuth via signInWithPopup"),
        bullet("Session managed by onAuthStateChanged listener"),

        new Paragraph({
          spacing: { before: 120, after: 60 },
          children: [new TextRun({ text: "3. Cloud Firestore (Database)", bold: true, size: 22, font: "Arial", color: DARK })]
        }),
        bullet("NoSQL cloud database — stores all task documents"),
        bullet("Each task linked to user via uid field"),
        bullet("onSnapshot enables real-time sync across devices"),

        new Paragraph({
          spacing: { before: 120, after: 60 },
          children: [new TextRun({ text: "4. Firebase Hosting (Optional)", bold: true, size: 22, font: "Arial", color: DARK })]
        }),
        bullet("Deploys React app to global CDN"),
        bullet("Free SSL, custom domain support"),
        bullet("Single command: firebase deploy"),
        ...gap(),

        // 4. WHAT RUNS ON THE CLOUD
        sectionTitle("4. What Runs on the Cloud?"),
        p("This is a cloud-based application because all data storage, authentication, and backend services are handled by Firebase, which is a cloud platform by Google. The application does not rely on local storage and can be accessed from anywhere via the internet."),
        ...gap(1),

        new Paragraph({
          spacing: { before: 100, after: 60 },
          children: [new TextRun({ text: "Database (Firestore)", bold: true, size: 22, font: "Arial", color: DARK })]
        }),
        bullet("Tasks stored on Google cloud servers, not on the user's device"),
        bullet("Accessible from any browser or device worldwide"),
        bullet("Data persists even after the browser is closed"),

        new Paragraph({
          spacing: { before: 100, after: 60 },
          children: [new TextRun({ text: "Authentication", bold: true, size: 22, font: "Arial", color: DARK })]
        }),
        bullet("Login/signup handled entirely by Firebase Auth cloud servers"),
        bullet("JWT tokens issued and verified by Firebase"),
        bullet("No custom backend or session management code required"),

        new Paragraph({
          spacing: { before: 100, after: 60 },
          children: [new TextRun({ text: "Real-time Sync", bold: true, size: 22, font: "Arial", color: DARK })]
        }),
        bullet("Two users opening the app simultaneously see identical task data"),
        bullet("Firestore onSnapshot pushes updates instantly — no polling or page refresh needed"),
        bullet("Powered entirely by Firebase cloud WebSocket infrastructure"),

        new Paragraph({
          spacing: { before: 100, after: 60 },
          children: [new TextRun({ text: "Hosting (Optional)", bold: true, size: 22, font: "Arial", color: DARK })]
        }),
        bullet("React app deployable to Firebase Hosting"),
        bullet("Globally distributed CDN — anyone can access via public URL"),
        ...gap(),

        // 5. API USED
        sectionTitle("5. API Level Details"),
        p("In this React + Firebase project, the Firebase Web API (via Firebase JavaScript SDK v10+) is used. It is a modular SDK that communicates directly with Firebase's cloud services."),
        ...gap(1),
        h("5.1 Firebase SDK Modules Used", HeadingLevel.HEADING_2),
        ...gap(1),
        apiTable(),
        ...gap(1),
        h("5.2 Key Firebase API Calls", HeadingLevel.HEADING_2),

        new Paragraph({
          spacing: { before: 120, after: 60 },
          children: [new TextRun({ text: "Authentication APIs:", bold: true, size: 22, font: "Arial", color: DARK })]
        }),
        ...codeBlock([
          "signInWithEmailAndPassword(auth, email, password)",
          "createUserWithEmailAndPassword(auth, email, password)",
          "signInWithPopup(auth, new GoogleAuthProvider())",
          "onAuthStateChanged(auth, (user) => { ... })",
          "signOut(auth)",
        ]),

        new Paragraph({
          spacing: { before: 160, after: 60 },
          children: [new TextRun({ text: "Firestore APIs:", bold: true, size: 22, font: "Arial", color: DARK })]
        }),
        ...codeBlock([
          "addDoc(collection(db, 'tasks'), { ...taskData, uid: user.uid })",
          "updateDoc(doc(db, 'tasks', taskId), { done: true })",
          "deleteDoc(doc(db, 'tasks', taskId))",
          "onSnapshot(query(collection(db,'tasks'), where('uid','==',uid)), snap => { ... })",
        ]),
        ...gap(),

        // 6. FOLDER STRUCTURE
        sectionTitle("6. Project Folder Structure"),
        ...codeBlock([
          "cloud-task-manager/",
          "├── public/",
          "│   └── index.html",
          "├── src/",
          "│   ├── components/",
          "│   │   ├── TaskForm.jsx     ← Add task (writes to Firestore)",
          "│   │   ├── TaskList.jsx     ← Real-time list (onSnapshot)",
          "│   │   └── TaskItem.jsx     ← Toggle / edit / delete task",
          "│   ├── firebase-config.js  ← YOUR CONFIG FILE",
          "│   ├── App.jsx             ← Auth state + main layout",
          "│   ├── App.css             ← All styles",
          "│   └── index.js            ← React entry point",
          "├── package.json",
          "└── .env                    ← Firebase API keys",
        ]),
        ...gap(),

        // 7. IMPLEMENTATION STEPS
        sectionTitle("7. Implementation Steps"),
        numbered("Create Firebase project at console.firebase.google.com"),
        numbered("Enable Authentication — Email/Password and Google providers"),
        numbered("Create Firestore Database in test mode"),
        numbered("Register Web App in Firebase — copy firebaseConfig object"),
        numbered("Create React app: npx create-react-app cloud-task-manager"),
        numbered("Install Firebase SDK: npm install firebase"),
        numbered("Create firebase-config.js — initialize app, auth, db"),
        numbered("Build App.jsx — onAuthStateChanged listener, auth forms"),
        numbered("Build TaskForm.jsx — addDoc to Firestore on submit"),
        numbered("Build TaskList.jsx — onSnapshot real-time listener"),
        numbered("Build TaskItem.jsx — updateDoc (toggle/edit), deleteDoc"),
        numbered("Add Firestore security rules — users see only their tasks"),
        numbered("Test: add ERROR task, verify real-time update on second tab"),
        numbered("Deploy: firebase init hosting && firebase deploy"),
        ...gap(),

        // 8. RESULTS
        sectionTitle("8. Results and Output"),
        p("The Cloud Task Manager successfully demonstrates all core cloud computing capabilities:"),
        ...gap(1),

        bullet("Authentication — Email/password and Google Sign-In working via Firebase Auth"),
        bullet("Real-time sync — onSnapshot updates task list instantly across all open browser tabs"),
        bullet("CRUD operations — Create, read, update, and delete tasks fully functional"),
        bullet("Cloud persistence — tasks survive logout and are accessible from any device"),
        bullet("Priority, category, due date fields with overdue detection"),
        bullet("Live stats dashboard — Total, Active, Done, Overdue counts update in real time"),
        ...gap(1),

        h("8.1 Sample Data Flow", HeadingLevel.HEADING_2),
        ...codeBlock([
          "User adds task → TaskForm.jsx → addDoc(db, 'tasks', data)",
          "Firestore stores → triggers onSnapshot → TaskList.jsx re-renders",
          "User marks done → TaskItem.jsx → updateDoc(doc, { done: true })",
          "User deletes → TaskItem.jsx → deleteDoc(doc) → list auto-updates",
        ]),
        ...gap(),

        // 9. USE CASES
        sectionTitle("9. Use Cases"),
        bullet("Personal task and to-do management with cloud backup"),
        bullet("Team task tracking with shared Firestore rules"),
        bullet("Student assignment management with due date alerts"),
        bullet("Project management with category filtering"),
        bullet("Daily routine tracking with priority levels"),
        ...gap(),

        // 10. ADVANTAGES
        sectionTitle("10. Advantages"),
        bullet("Fully serverless — no backend server required"),
        bullet("Real-time updates — no page refresh or polling needed"),
        bullet("Accessible from any device via the internet"),
        bullet("Secure authentication — handled by Firebase cloud"),
        bullet("Cost-effective — free tier covers small-to-medium usage"),
        bullet("Easy to extend — add more AWS/Firebase services without rewriting"),
        bullet("Scalable — Firebase handles millions of concurrent users automatically"),
        ...gap(),

        // 11. LIMITATIONS
        sectionTitle("11. Limitations"),
        bullet("Requires Firebase account and project configuration"),
        bullet("Firestore queries limited by composite index requirements"),
        bullet("Alert/notification system not built-in (requires additional service)"),
        bullet("Offline support requires Firestore offline persistence plugin"),
        bullet("Free tier has Firestore read/write quota limits"),
        ...gap(),

        // 12. CONCLUSION
        sectionTitle("12. Conclusion"),
        p("This project demonstrates an efficient, scalable, cloud-based task management solution built using React and Firebase. By leveraging Firebase Authentication for secure login, Firestore for real-time cloud data storage, and React for a responsive user interface, the system eliminates the need for a custom backend while providing robust, production-grade features."),
        ...gap(1),
        p("The architecture is serverless, accessible globally, and updates in real time — making it a practical example of modern cloud computing applied to everyday software development. The project significantly demonstrates key cloud concepts: cloud storage, cloud authentication, real-time sync, and optional cloud hosting — all powered by a managed cloud platform."),
        ...gap(),

        // REFERENCES
        sectionTitle("References"),
        numbered("Firebase Documentation — https://firebase.google.com/docs"),
        numbered("React Documentation — https://react.dev"),
        numbered("Firestore Real-time Updates — https://firebase.google.com/docs/firestore/query-data/listen"),
        numbered("Firebase Authentication — https://firebase.google.com/docs/auth"),
        numbered("Cloud Computing: Principles and Paradigms — Rajkumar Buyya et al."),
      ]
    }
  ]
});

// FIX: Use __dirname to save the file in the same folder as the script
const outputPath = path.join(__dirname, "CloudTaskManager_Report.docx");

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync(outputPath, buffer);
  console.log("Done! File saved to: " + outputPath);
});