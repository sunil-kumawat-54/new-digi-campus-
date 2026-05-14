import React, { useState, useEffect, useMemo, useRef } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import * as LucideIcons from 'lucide-react';
import { supabase } from './supabaseClient';


// ─── GLOBAL MOCK DATA ───────────────────────────────────────────────
window.OrchestraData = {
  student: {
    name: "Sunil Kumar", roll: "JIETADM10904", enrollment: "EN2024CSE0472",
    branch: "B.Tech CSE (AIML)", semester: "IV", section: "B",
    dob: "2004-08-15", phone: "+91 98765 43210", email: "sunil.kumar@orchestra.edu",
    cgpa: 8.4, credits: 96, maxCredits: 120, backlogs: 0,
    linkedin: "linkedin.com/in/sunilkumar", github: "github.com/sunilkumar",
    admNo: "ADM2024001", category: "General", quota: "Merit",
    photo: "/assets/student_avatar_male_1778439437308.png"
  },

  announcements: [
    { id:1, category:"Exam", title:"End Semester Examination Schedule Released", body:"The timetable for End Sem exams (May–June 2025) has been published. Download from the portal.", time:"2h ago", color:"#6366F1" },
    { id:2, category:"Event", title:"Technovation 2025 — Annual Tech Fest", body:"Register your teams for hackathon, paper presentation, and robotics by May 15th.", time:"5h ago", color:"#E8A87C" },
    { id:3, category:"Notice", title:"Fee Payment Deadline Extended", body:"The last date for semester fee submission has been extended to May 20, 2025.", time:"1d ago", color:"#34D399" },
    { id:4, category:"Exam", title:"Internal Assessment Marks Updated", body:"IA marks for all subjects have been updated. Students can view them in the Academics section.", time:"2d ago", color:"#6366F1" },
    { id:5, category:"Notice", title:"Library Timings Revised", body:"Library will now operate from 8 AM to 10 PM on all working days.", time:"3d ago", color:"#F59E0B" },
  ],

  stats: [
    { label:"Attendance", value:82, unit:"%", trend:"up", trendVal:"+3%", color:"#34D399" },
    { label:"Pending Fees", value:24500, unit:"₹", trend:"down", trendVal:"-₹5k", color:"#EF4444" },
    { label:"Registered Courses", value:6, unit:"", trend:"up", trendVal:"+1", color:"#6366F1" },
    { label:"Upcoming Exams", value:4, unit:"", trend:"up", trendVal:"+2", color:"#E8A87C" },
  ],

  todaySchedule: [
    { time:"08:30", end:"09:30", subject:"Data Structures & Algorithms", room:"CS-201", faculty:"Dr. Priya Sharma", type:"Lecture" },
    { time:"09:30", end:"10:30", subject:"Machine Learning Fundamentals", room:"AI-101", faculty:"Prof. Rajesh Verma", type:"Lecture" },
    { time:"11:00", end:"13:00", subject:"Deep Learning Lab", room:"DL-Lab 3", faculty:"Dr. Ananya Iyer", type:"Lab" },
    { time:"14:00", end:"15:00", subject:"Engineering Mathematics IV", room:"M-301", faculty:"Dr. Suresh Nair", type:"Lecture" },
    { time:"15:00", end:"16:00", subject:"Software Engineering", room:"CS-105", faculty:"Prof. Meera Patel", type:"Lecture" },
  ],

  foodMenu: {
    breakfast: [{ item:"Poha + Tea", availed:true }, { item:"Boiled Eggs", availed:true }, { item:"Bread & Butter", availed:false }],
    lunch: [{ item:"Dal Tadka", availed:true }, { item:"Jeera Rice", availed:true }, { item:"Mix Veg Sabzi", availed:true }, { item:"Roti (4)", availed:true }],
    dinner: [{ item:"Paneer Masala", availed:false }, { item:"Chapati (3)", availed:false }, { item:"Rice & Dahi", availed:false }],
  },

  courses: [
    { code:"CS401", name:"Data Structures & Algorithms", credits:4, faculty:"Dr. Priya Sharma", slots:12, type:"Core", registered:true },
    { code:"AI301", name:"Machine Learning Fundamentals", credits:4, faculty:"Prof. Rajesh Verma", slots:8, type:"Core", registered:true },
    { code:"AI302", name:"Deep Learning & Neural Networks", credits:3, faculty:"Dr. Ananya Iyer", slots:5, type:"Elective", registered:true },
    { code:"CS402", name:"Software Engineering", credits:3, faculty:"Prof. Meera Patel", slots:20, type:"Core", registered:true },
    { code:"MA401", name:"Engineering Mathematics IV", credits:4, faculty:"Dr. Suresh Nair", slots:30, type:"Core", registered:true },
    { code:"CS403", name:"Computer Networks", credits:3, faculty:"Prof. Anil Sharma", slots:15, type:"Core", registered:true },
    { code:"AI303", name:"Natural Language Processing", credits:3, faculty:"Dr. Kavya Reddy", slots:0, type:"Elective", registered:false },
    { code:"CS404", name:"Database Management Systems", credits:3, faculty:"Dr. Vikram Singh", slots:7, type:"Core", registered:false },
    { code:"AI304", name:"Computer Vision", credits:3, faculty:"Prof. Sanjay Gupta", slots:10, type:"Elective", registered:false },
    { code:"CS405", name:"Cloud Computing Lab", credits:2, faculty:"Dr. Neha Tiwari", slots:18, type:"Lab", registered:false },
    { code:"HU401", name:"Technical Writing & Communication", credits:2, faculty:"Prof. Sunita Das", slots:25, type:"Elective", registered:false },
    { code:"CS406", name:"Cybersecurity Fundamentals", credits:3, faculty:"Dr. Arjun Mehta", slots:9, type:"Elective", registered:false },
  ],

  admissionSteps: ["Form Submitted","Documents Uploaded","Fee Paid","Verification","Admitted"],
  currentStep: 3,

  documents: [
    { name:"10th Marksheet", status:"verified" },
    { name:"12th Marksheet", status:"verified" },
    { name:"Transfer Certificate", status:"pending" },
    { name:"Aadhar Card", status:"verified" },
    { name:"Passport Photo", status:"verified" },
    { name:"Migration Certificate", status:"missing" },
    { name:"Medical Certificate", status:"pending" },
    { name:"Character Certificate", status:"verified" },
  ],

  admissionDates: [
    { event:"Application Open", date:"Jan 15, 2024" },
    { event:"Last Date to Apply", date:"Mar 31, 2024" },
    { event:"Merit List Published", date:"Apr 20, 2024" },
    { event:"Documents Verification", date:"May 5–10, 2024" },
    { event:"Fee Payment Deadline", date:"May 20, 2024" },
    { event:"Orientation Day", date:"Jun 15, 2024" },
  ],

  fees: {
    total: 125000, paid: 100500, pending: 24500, dueDate: "May 20, 2025",
    breakdown: [
      { name:"Tuition", value:75000, color:"#6366F1" },
      { name:"Hostel", value:30000, color:"#E8A87C" },
      { name:"Transport", value:12000, color:"#34D399" },
      { name:"Misc", value:8000, color:"#F59E0B" },
    ],
    transactions: [
      { date:"Jan 10, 2025", desc:"Tuition Fee – Sem IV", amount:37500, mode:"Online (UPI)", status:"paid" },
      { date:"Jan 10, 2025", desc:"Hostel Fee – Jan to Jun", amount:15000, mode:"Online (NEFT)", status:"paid" },
      { date:"Feb 5, 2025", desc:"Exam Fee – Sem IV", amount:2500, mode:"Online (UPI)", status:"paid" },
      { date:"Mar 1, 2025", desc:"Transport Fee – Sem IV", amount:6000, mode:"Cash", status:"paid" },
      { date:"Apr 15, 2025", desc:"Library & Misc Charges", amount:3000, mode:"Online (UPI)", status:"paid" },
      { date:"May 1, 2025", desc:"Tuition Fee – Sem IV (2nd Inst.)", amount:37500, mode:"—", status:"pending" },
      { date:"May 20, 2025", desc:"Hostel Fee – Jul to Dec", amount:15000, mode:"—", status:"pending" },
      { date:"Mar 10, 2025", desc:"Sports & Cultural Fee", amount:1000, mode:"—", status:"overdue" },
    ],
  },

  attendance: [
    { subject:"Data Structures & Algorithms", total:42, present:38, type:"Core" },
    { subject:"Machine Learning Fundamentals", total:38, present:30, type:"Core" },
    { subject:"Deep Learning Lab", total:24, present:22, type:"Lab" },
    { subject:"Software Engineering", total:36, present:27, type:"Core" },
    { subject:"Engineering Mathematics IV", total:40, present:35, type:"Core" },
    { subject:"Computer Networks", total:34, present:20, type:"Core" },
    { subject:"Natural Language Processing", total:28, present:25, type:"Elective" },
    { subject:"Database Management Systems", total:32, present:28, type:"Core" },
  ],

  // 30 days attendance status: 0=holiday, 1=present, 2=absent, 3=leave
  calendarData: [1,1,0,1,1,2,1,1,1,0,1,2,1,1,1,0,1,1,1,1,0,2,1,1,0,1,1,2,1,1],

  faculty: [
    { id:1, name:"Dr. Priya Sharma", designation:"Associate Professor", dept:"Computer Science", email:"priya.sharma@orchestra.edu", phone:"+91 98100 11223", courses:["DSA","Algorithms"], hours:"Mon-Wed 2-4 PM", pubs:18, exp:"12 yrs", initials:"PS" },
    { id:2, name:"Prof. Rajesh Verma", designation:"Assistant Professor", dept:"AI & ML", email:"rajesh.verma@orchestra.edu", phone:"+91 97200 44556", courses:["ML Fundamentals","Statistical Learning"], hours:"Tue-Thu 11-1 PM", pubs:9, exp:"7 yrs", initials:"RV" },
    { id:3, name:"Dr. Ananya Iyer", designation:"Professor", dept:"AI & ML", email:"ananya.iyer@orchestra.edu", phone:"+91 96300 77889", courses:["Deep Learning","Computer Vision"], hours:"Mon-Fri 4-5 PM", pubs:32, exp:"18 yrs", initials:"AI" },
    { id:4, name:"Prof. Meera Patel", designation:"Assistant Professor", dept:"Computer Science", email:"meera.patel@orchestra.edu", phone:"+91 95400 22334", courses:["Software Engineering","SDLC"], hours:"Wed-Fri 10-12 PM", pubs:6, exp:"5 yrs", initials:"MP" },
    { id:5, name:"Dr. Suresh Nair", designation:"Professor", dept:"Mathematics", email:"suresh.nair@orchestra.edu", phone:"+91 94500 55667", courses:["Engg. Math IV","Discrete Math"], hours:"Mon-Thu 1-2 PM", pubs:24, exp:"20 yrs", initials:"SN" },
    { id:6, name:"Prof. Anil Sharma", designation:"Associate Professor", dept:"Computer Science", email:"anil.sharma@orchestra.edu", phone:"+91 93600 88900", courses:["Computer Networks","Protocol Design"], hours:"Tue-Wed 3-5 PM", pubs:11, exp:"10 yrs", initials:"AS" },
    { id:7, name:"Dr. Kavya Reddy", designation:"Assistant Professor", dept:"AI & ML", email:"kavya.reddy@orchestra.edu", phone:"+91 92700 33445", courses:["NLP","Text Mining"], hours:"Mon-Fri 12-1 PM", pubs:14, exp:"8 yrs", initials:"KR" },
    { id:8, name:"Dr. Vikram Singh", designation:"Associate Professor", dept:"Computer Science", email:"vikram.singh@orchestra.edu", phone:"+91 91800 66778", courses:["DBMS","Big Data"], hours:"Thu-Fri 2-4 PM", pubs:19, exp:"14 yrs", initials:"VS" },
    { id:9, name:"Prof. Sanjay Gupta", designation:"Assistant Professor", dept:"AI & ML", email:"sanjay.gupta@orchestra.edu", phone:"+91 90900 11122", courses:["Computer Vision","Image Processing"], hours:"Mon-Wed 10-11 AM", pubs:7, exp:"4 yrs", initials:"SG" },
    { id:10, name:"Dr. Neha Tiwari", designation:"Associate Professor", dept:"Computer Science", email:"neha.tiwari@orchestra.edu", phone:"+91 89000 44455", courses:["Cloud Computing","DevOps"], hours:"Tue-Thu 4-6 PM", pubs:13, exp:"11 yrs", initials:"NT" },
    { id:11, name:"Prof. Sunita Das", designation:"Assistant Professor", dept:"Humanities", email:"sunita.das@orchestra.edu", phone:"+91 88100 77788", courses:["Technical Writing","Communication"], hours:"Mon-Fri 9-10 AM", pubs:4, exp:"6 yrs", initials:"SD" },
    { id:12, name:"Dr. Arjun Mehta", designation:"Professor", dept:"Computer Science", email:"arjun.mehta@orchestra.edu", phone:"+91 87200 00011", courses:["Cybersecurity","Ethical Hacking"], hours:"Wed-Fri 3-5 PM", pubs:28, exp:"16 yrs", initials:"AM" },
  ],

  deptColors: {
    "Computer Science":"#6366F1", "AI & ML":"#34D399", "Mathematics":"#E8A87C",
    "Physics":"#F59E0B", "Humanities":"#A78BFA",
  },

  exams: [
    { date:"2025-05-20", day:"Tuesday", subject:"Engineering Mathematics IV", time:"09:00 AM", room:"E-101", duration:"3 hrs", status:"upcoming" },
    { date:"2025-05-22", day:"Thursday", subject:"Data Structures & Algorithms", time:"09:00 AM", room:"CS-201", duration:"3 hrs", status:"upcoming" },
    { date:"2025-05-24", day:"Saturday", subject:"Machine Learning Fundamentals", time:"02:00 PM", room:"AI-101", duration:"3 hrs", status:"upcoming" },
    { date:"2025-05-26", day:"Monday", subject:"Computer Networks", time:"09:00 AM", room:"E-203", duration:"3 hrs", status:"upcoming" },
    { date:"2025-05-28", day:"Wednesday", subject:"Software Engineering", time:"02:00 PM", room:"CS-301", duration:"3 hrs", status:"upcoming" },
    { date:"2025-05-30", day:"Friday", subject:"Deep Learning & Neural Networks", time:"09:00 AM", room:"AI-102", duration:"3 hrs", status:"upcoming" },
    { date:"2025-06-02", day:"Monday", subject:"Database Management Systems", time:"02:00 PM", room:"CS-202", duration:"3 hrs", status:"upcoming" },
    { date:"2025-06-04", day:"Wednesday", subject:"Natural Language Processing", time:"09:00 AM", room:"AI-103", duration:"3 hrs", status:"upcoming" },
    { date:"2025-05-06", day:"Tuesday", subject:"Engineering Physics", time:"09:00 AM", room:"P-101", duration:"3 hrs", status:"completed" },
    { date:"2025-05-08", day:"Thursday", subject:"Professional Ethics", time:"02:00 PM", room:"H-201", duration:"2 hrs", status:"completed" },
  ],

  notifications: [
    { id:1, title:"Exam schedule released", body:"End Sem timetable is now available.", time:"10 min ago", read:false },
    { id:2, title:"Fee payment reminder", body:"₹24,500 pending — due May 20.", time:"2h ago", read:false },
    { id:3, title:"Assignment submitted", body:"Your DSA assignment has been graded.", time:"Yesterday", read:false },
  ],
  students: [
    { id: "24EJIAI142", name: "Sunil Kumar", branch: "CSE (AIML)", sem: "IV", section: "A", status: "Active" },
    { id: "24EJIAI143", name: "Rahul Sharma", branch: "CSE (AIML)", sem: "IV", section: "A", status: "Active" },
    { id: "24EJIAI144", name: "Ananya Gupta", branch: "CSE (AIML)", sem: "IV", section: "A", status: "Active" },
    { id: "24EJIAI145", name: "Isha Malhotra", branch: "CSE (AIML)", sem: "IV", section: "B", status: "Active" },
    { id: "24EJICV088", name: "Vikram Rathore", branch: "Civil", sem: "IV", section: "B", status: "Active" },
    { id: "24EJICV089", name: "Amitabh Jain", branch: "Civil", sem: "IV", section: "B", status: "Active" },
    { id: "24EJIMX012", name: "Meera Singh", branch: "Mechanical", sem: "IV", section: "A", status: "Active" },
    { id: "24EJIMX013", name: "Karan Johar", branch: "Mechanical", sem: "IV", section: "A", status: "Inactive" },
    { id: "24EJICS001", name: "Aditi Rao", branch: "CSE", sem: "VI", section: "A", status: "Active" },
    { id: "24EJICS002", name: "Rohan Varma", branch: "CSE", sem: "VI", section: "A", status: "Active" },
    { id: "24EJIE101", name: "Sanya Mirza", branch: "Electrical", sem: "II", section: "C", status: "Active" },
    { id: "24EJIE102", name: "Virat Kohli", branch: "Electrical", sem: "II", section: "C", status: "Active" },
  ]
};

// ─── ADD FACULTY & ADMIN DATA ──────────────────────────────────────────
window.OrchestraData.faculty = {
  name: "Dr. Priya Sharma",
  id: "FAC2024001",
  dept: "Computer Science",
  designation: "Associate Professor",
  email: "priya.sharma@orchestra.edu",
  avatar: "PS"
};

window.OrchestraData.admin = {
  name: "Rajesh Malhotra",
  id: "ADM99901",
  dept: "Administration",
  designation: "Super Admin",
  email: "admin@orchestra.edu",
  avatar: "RM",
  photo: "/assets/student_avatar_male_1778439437308.png"
};

window.OrchestraData.applicants = [
  { id: "APP2024001", name: "Aarav Sharma", type: "Scholarship", branch: "CSE", status: "Verified", date: "May 01", photo: "/assets/student_avatar_male_1778439437308.png", docs: { "10th": "verified", "12th": "verified", "ID": "verified" } },
  { id: "APP2024002", name: "Priya Patel", type: "Direct", branch: "Mechanical", status: "Pending", date: "May 02", photo: "/assets/student_avatar_female_1778439688200.png", docs: { "10th": "verified", "12th": "missing", "ID": "verified" } },
  { id: "APP2024003", name: "Kabir Singh", type: "Scholarship", branch: "Civil", status: "Verified", date: "May 03", photo: "/assets/student_avatar_male_1778439437308.png", docs: { "10th": "verified", "12th": "verified", "ID": "verified" } },
  { id: "APP2024004", name: "Sanya Gupta", type: "Direct", branch: "CSE (AIML)", status: "Pending", date: "May 04", photo: "/assets/student_avatar_female_1778439688200.png", docs: { "10th": "verified", "12th": "pending", "ID": "verified" } },
];



// ─── DASHBOARD MODULE ───────────────────────────────────────────────────────
window.DashboardModule = function DashboardModule({ userRole }) {
  const d = window.OrchestraData;
  const [activeTab, setActiveTab] = useState('Home');
  const [showAllFood, setShowAllFood] = useState(false);
  const [showAllClasses, setShowAllClasses] = useState(false);

  return (
    <div className="page-enter" style={{ display: 'flex', gap: 20, padding: '16px 20px', height: '100%', background: 'transparent', overflowY: 'auto' }}>
      {/* Center Feed */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 20, paddingRight: 10 }}>
        {/* Admission/Status Banner */}
        {userRole === 'student' && (
          <div className="glass-card" style={{ position: 'relative', overflow: 'hidden', padding: 0 }}>
            <img src="/assets/university_campus_banner_1778439312389.png" style={{ width: '100%', height: '120px', objectFit: 'cover', opacity: 0.6 }} />
            <div style={{ padding: '20px 24px', position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent, #0D0F14)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 className="font-syne" style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>Admission Process</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#34D399', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>✓</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Form Submitted <span style={{ opacity: 0.6 }}>• 29 Jun 09:42 am</span></div>
              </div>
            </div>
            <button className="btn-outline" style={{ background: '#e2e8f0', borderColor: '#cbd5e1', color: '#64748b', padding: '10px 24px' }} onClick={() => notify('Redirecting to Fee Payment Portal...')}>Pay fee online</button>
          </div>
          </div>
        )}

        {/* Action Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', gap: 24 }}>
          {['Show only', 'Saved Posts', 'My Posts'].map(t => (
            <div key={t} style={{ padding: '12px 4px', fontSize: 13, color: '#64748b', cursor: 'pointer', borderBottom: '2px solid transparent' }}>{t}</div>
          ))}
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 15 }}>
            <span style={{ fontSize: 13, color: '#64748b', cursor: 'pointer' }} onClick={() => notify('Filtering by category...')}>Category ▾</span>
            <span style={{ fontSize: 13, color: '#64748b', cursor: 'pointer' }} onClick={() => notify('Filtering by booth...')}>Booth ▾</span>
          </div>
        </div>

        {/* Feed Items */}
        {d.announcements.map(a => (
          <div key={a.id} className="glass-card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
              <div style={{ width: 40, height: 40, borderRadius: 8, background: '#8B5CF622', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🏛️</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700 }}>MAIN CAMPUS</div>
                <div style={{ fontSize: 12, color: '#94A3B8' }}>05 May</div>
              </div>
            </div>
            <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 12, color: 'var(--text-main)' }}>{a.title}</h2>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 20 }}>{a.body}</p>
            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 16, display: 'flex', gap: 24 }}>
              <span style={{ fontSize: 13, color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }} onClick={() => notify('Opening comments...')}>
                <Icon name="MessageSquare" size={14} /> Comment
              </span>
              <span style={{ fontSize: 13, color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }} onClick={() => notify('Post shared to your profile!')}>
                <Icon name="Share2" size={14} /> Share
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Right Column */}
      <div style={{ width: 320, display: 'flex', flexDirection: 'column', gap: 20, flexShrink: 0 }}>
        {/* Food Section */}
        <div className="glass-card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h4 style={{ fontSize: 14, fontWeight: 700 }}>Food 🍲</h4>
            <span style={{ fontSize: 12, color: '#6366F1', fontWeight: 600, cursor: 'pointer' }} onClick={() => setShowAllFood(p=>!p)}>{showAllFood ? 'Hide' : 'View All'}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ padding: 12, background: 'rgba(255,255,255,0.02)', borderRadius: 8, border: '1px solid #f1f5f9' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>Breakfast (CAMPUS MESS)</span>
                <span style={{ fontSize: 11, color: '#34D399', fontWeight: 700 }}>Availed</span>
              </div>
              <div style={{ fontSize: 11, color: '#64748b', marginBottom: 8 }}>8:00 AM - 9:00 AM</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>• Tea, Coffee, Aloo Paratha, Curd</div>
            </div>
            {showAllFood && (
              <>
                <div style={{ padding: 12, background: 'rgba(255,255,255,0.02)', borderRadius: 8, border: '1px solid #f1f5f9' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>Lunch</span>
                    <span style={{ fontSize: 11, color: '#F59E0B', fontWeight: 700 }}>Upcoming</span>
                  </div>
                  <div style={{ fontSize: 11, color: '#64748b', marginBottom: 8 }}>1:00 PM - 2:30 PM</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>• Roti, Dal Makhani, Paneer, Rice</div>
                </div>
                <div style={{ padding: 12, background: 'rgba(255,255,255,0.02)', borderRadius: 8, border: '1px solid #f1f5f9' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>Dinner</span>
                    <span style={{ fontSize: 11, color: '#64748B', fontWeight: 700 }}>Pending</span>
                  </div>
                  <div style={{ fontSize: 11, color: '#64748b', marginBottom: 8 }}>8:00 PM - 9:30 PM</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>• Mixed Veg, Dal Tadka, Roti, Dessert</div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Classes Section */}
        <div className="glass-card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h4 style={{ fontSize: 14, fontWeight: 700 }}>Classes 📖</h4>
            <span style={{ fontSize: 12, color: '#6366F1', fontWeight: 600, cursor: 'pointer' }} onClick={() => setShowAllClasses(p=>!p)}>{showAllClasses ? 'Hide' : 'View All'}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ padding: 16, background: 'rgba(255,255,255,0.02)', borderRadius: 8, border: '1px solid #f1f5f9', position: 'relative' }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>In House training II Year</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ fontSize: 12 }}><span style={{ color: '#64748b', width: 60, display: 'inline-block' }}>Time :</span> 7:15 AM - 9:30 AM</div>
                <div style={{ fontSize: 12 }}><span style={{ color: '#64748b', width: 60, display: 'inline-block' }}>Type :</span> Workshop</div>
                <div style={{ fontSize: 12 }}><span style={{ color: '#64748b', width: 60, display: 'inline-block' }}>Faculty :</span> Dr. R. Sharma</div>
              </div>
            </div>
            {showAllClasses && (
              <>
                <div style={{ padding: 16, background: 'rgba(255,255,255,0.02)', borderRadius: 8, border: '1px solid #f1f5f9', position: 'relative' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>Data Structures & Algorithms</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div style={{ fontSize: 12 }}><span style={{ color: '#64748b', width: 60, display: 'inline-block' }}>Time :</span> 10:00 AM - 11:30 AM</div>
                    <div style={{ fontSize: 12 }}><span style={{ color: '#64748b', width: 60, display: 'inline-block' }}>Type :</span> Lecture</div>
                    <div style={{ fontSize: 12 }}><span style={{ color: '#64748b', width: 60, display: 'inline-block' }}>Faculty :</span> Dr. Priya Sharma</div>
                  </div>
                </div>
                <div style={{ padding: 16, background: 'rgba(255,255,255,0.02)', borderRadius: 8, border: '1px solid #f1f5f9', position: 'relative' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>Operating Systems Lab</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div style={{ fontSize: 12 }}><span style={{ color: '#64748b', width: 60, display: 'inline-block' }}>Time :</span> 2:00 PM - 4:00 PM</div>
                    <div style={{ fontSize: 12 }}><span style={{ color: '#64748b', width: 60, display: 'inline-block' }}>Type :</span> Practical</div>
                    <div style={{ fontSize: 12 }}><span style={{ color: '#64748b', width: 60, display: 'inline-block' }}>Faculty :</span> Prof. M. Patel</div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};



// ─── STUDENT PROFILE MODULE ─────────────────────────────────────────────────
window.ProfileModule = function ProfileModule({ userRole }) {
  const d = userRole === 'student' ? window.OrchestraData.student : 
           userRole === 'teacher' ? window.OrchestraData.faculty : 
           window.OrchestraData.admin;
           
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ ...d });

  const Field = ({ label, field, type="text" }) => (
    <div style={{display:'flex',flexDirection:'column',gap:5}}>
      <label style={{fontSize:11,color:'#64748B',fontWeight:600,textTransform:'uppercase',letterSpacing:'.6px'}}>{label}</label>
      {editing
        ? <input className="input-field" type={type} value={form[field]} onChange={e=>setForm(p=>({...p,[field]:e.target.value}))}/>
        : <div style={{fontSize:13,color:'#E2E8F0',padding:'9px 0',borderBottom:'1px solid rgba(99,102,241,.08)'}}>{form[field]}</div>
      }
    </div>
  );

  const cgpa = d.cgpa || 0;
  const r = 45, cx = 56, cy = 56;
  const circ = 2 * Math.PI * r;
  const dash = (cgpa / 10) * circ;

  return (
    <div className="page-enter" style={{overflowY:'auto',height:'100%'}}>
      <div style={{height:160,background:'linear-gradient(135deg,#6366F1,#4F46E5,#13161E)',position:'relative',borderBottom:'1px solid rgba(99,102,241,.15)',flexShrink:0}}>
        <div style={{position:'absolute',inset:0,background:'radial-gradient(ellipse at 30% 50%,rgba(99,102,241,.18) 0%,transparent 65%)'}}/>
        <div style={{position:'absolute',bottom:-36,left:36}}>
          <div style={{width:88,height:88,borderRadius:'50%',background:'linear-gradient(135deg,#6366F1,#8B5CF6)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:30,fontWeight:800,color:'#fff',fontFamily:'Syne,sans-serif',border:'3px solid #0D0F14',boxShadow:'0 0 20px rgba(0,0,0,.4)', overflow: 'hidden'}}>
            <img src={form.photo || (userRole === 'teacher' ? '/assets/student_avatar_female_1778439688200.png' : '/assets/student_avatar_male_1778439437308.png')} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        </div>
        <div style={{position:'absolute',bottom:20,left:144}}>
          <h1 className="font-syne" style={{fontSize:28,fontWeight:800,color:'#fff',marginBottom:4, letterSpacing: '0.5px'}}>{form.name}</h1>
          <div style={{fontSize:12,color:'rgba(255,255,255,0.85)'}}>{form.id || form.roll} • {form.dept || form.branch} {form.designation ? `• ${form.designation}` : ''}</div>
        </div>
        <div style={{position:'absolute',top:16,right:24}}>
          <button className={editing?'btn-primary':'btn-outline'} style={{ background: editing ? '#6366F1' : 'rgba(255,255,255,0.1)', color: 'white', borderColor: 'white' }} onClick={()=>{ if(editing) notify('Profile saved successfully!'); setEditing(p=>!p); }}>
            {editing ? '💾 Save Profile' : '✏️ Edit Profile'}
          </button>
        </div>
      </div>

      <div style={{padding:'52px 28px 28px',display:'grid',gridTemplateColumns:'1fr 1fr',gap:24}}>
        <div className="glass-card" style={{padding:24}}>
          <h3 className="font-syne" style={{fontSize:14,fontWeight:700,color:'#94A3B8',textTransform:'uppercase',letterSpacing:'.7px',marginBottom:20,borderBottom:'1px solid rgba(99,102,241,.1)',paddingBottom:10}}>Personal Information</h3>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:18}}>
            <Field label="Full Name" field="name"/>
            <Field label="Date of Birth" field="dob" type="date"/>
            <Field label="Phone Number" field="phone"/>
            <Field label="Email Address" field="email" type="email"/>
            <Field label="LinkedIn" field="linkedin"/>
            <Field label="GitHub" field="github"/>
          </div>
        </div>

        <div className="glass-card" style={{padding:24}}>
          <h3 className="font-syne" style={{fontSize:14,fontWeight:700,color:'#94A3B8',textTransform:'uppercase',letterSpacing:'.7px',marginBottom:20,borderBottom:'1px solid rgba(99,102,241,.1)',paddingBottom:10}}>Academic Details</h3>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:18}}>
            <Field label="Roll Number" field="roll"/>
            <Field label="Enrollment No." field="enrollment"/>
            <Field label="Branch" field="branch"/>
            <Field label="Semester" field="semester"/>
            <Field label="Section" field="section"/>
            <Field label="Admission No." field="admNo"/>
          </div>
        </div>

        <div className="glass-card" style={{padding:24}}>
          <h3 className="font-syne" style={{fontSize:14,fontWeight:700,color:'#94A3B8',textTransform:'uppercase',letterSpacing:'.7px',marginBottom:20,borderBottom:'1px solid rgba(99,102,241,.1)',paddingBottom:10}}>Academic Summary</h3>
          <div style={{display:'flex',alignItems:'center',gap:32}}>
            <div style={{position:'relative',width:112,height:112,flexShrink:0}}>
              <svg width="112" height="112" viewBox="0 0 112 112">
                <circle cx="56" cy="56" r={r} fill="none" stroke="rgba(99,102,241,.12)" strokeWidth="10"/>
                <circle cx="56" cy="56" r={r} fill="none" stroke="#6366F1" strokeWidth="10"
                  strokeDasharray={`${dash} ${circ - dash}`}
                  strokeDashoffset={circ/4}
                  strokeLinecap="round"
                />
              </svg>
              <div style={{position:'absolute',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}}>
                <div style={{fontSize:22,fontWeight:800,fontFamily:'Syne,sans-serif',color:'#6366F1'}}>{d.cgpa}</div>
                <div style={{fontSize:10,color:'#64748B',textTransform:'uppercase'}}>CGPA</div>
              </div>
            </div>
            <div style={{flex:1,display:'flex',flexDirection:'column',gap:16}}>
              <div>
                <div style={{display:'flex',justifyContent:'space-between',fontSize:12,marginBottom:6}}>
                  <span style={{color:'#94A3B8'}}>Credits Earned</span>
                  <span style={{color:'#6366F1',fontWeight:600}}>{d.credits}/{d.maxCredits}</span>
                </div>
                <div className="progress-bar" style={{ height: 6, background: '#f1f5f9', borderRadius: 3, overflow: 'hidden' }}>
                  <div className="progress-fill" style={{height:'100%',width:`${(d.credits/d.maxCredits)*100}%`,background:'#6366F1'}}/>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="glass-card" style={{padding:24}}>
          <h3 className="font-syne" style={{fontSize:14,fontWeight:700,color:'#94A3B8',textTransform:'uppercase',letterSpacing:'.7px',marginBottom:20,borderBottom:'1px solid rgba(99,102,241,.1)',paddingBottom:10}}>Student ID Card</h3>
          <div style={{background:'linear-gradient(135deg,#6366F1,#4F46E5)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:12,padding:'20px',position:'relative',overflow:'hidden',color:'white'}}>
            <div style={{display:'flex',gap:16,alignItems:'center'}}>
              <div style={{width:56,height:56,borderRadius:'50%',background:'white',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,fontWeight:800,color:'#6366F1',fontFamily:'Syne,sans-serif'}}>SK</div>
              <div>
                <div style={{fontSize:16,fontWeight:700,fontFamily:'Syne,sans-serif'}}>{form.name}</div>
                <div style={{fontSize:11,opacity:0.8}}>{form.roll}</div>
                <div style={{fontSize:11,opacity:0.8}}>{form.branch}</div>
              </div>
            </div>
            <div style={{marginTop:14,paddingTop:14,borderTop:'1px solid rgba(255,255,255,0.2)',display:'flex',justifyContent:'space-between',fontSize:11,opacity:0.8}}>
              <span>Orchestra University</span>
              <span>2024–25</span>
            </div>
          </div>
          <button className="btn-primary" style={{width:'100%',marginTop:14,background:'#6366F1'}} onClick={() => notify('Downloading ID Card...')}>⬇ Download ID Card</button>
        </div>
      </div>
    </div>
  );
};

// ─── TEACHER ATTENDANCE MODULE ──────────────────────────────────────────────
window.AttendanceModule = function AttendanceModule() {
  const d = window.OrchestraData;
  const [branch, setBranch] = useState('All');
  const [marked, setMarked] = useState({}); // { studentId: true/false }

  const branches = ['All', 'CSE (AIML)', 'Civil', 'Mechanical', 'Electrical'];
  const filtered = d.students.filter(s => branch === 'All' || s.branch === branch);

  const toggleAll = (present) => {
    const next = { ...marked };
    filtered.forEach(s => next[s.id] = present);
    setMarked(next);
  };

  return (
    <div className="page-enter" style={{ padding: 24, height: '100%', overflowY: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 className="font-syne" style={{ fontSize: 22, fontWeight: 800 }}>Attendance Marking</h2>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Date: {new Date().toLocaleDateString()}</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn-outline" onClick={() => toggleAll(true)}>Mark All P</button>
          <button className="btn-primary" onClick={() => notify('Attendance saved successfully!')}>Save Attendance</button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        {branches.map(b => (
          <button key={b} onClick={() => setBranch(b)} style={{ 
            padding: '8px 16px', borderRadius: 8, fontSize: 12, fontWeight: 600,
            background: branch === b ? '#6366F1' : 'rgba(255,255,255,0.05)',
            color: 'white', border: 'none', cursor: 'pointer'
          }}>{b}</button>
        ))}
      </div>

      <div className="glass-card" style={{ overflow: 'hidden' }}>
        <table className="data-table">
          <thead>
            <tr><th>Student ID</th><th>Name</th><th>Branch</th><th>Sem/Sec</th><th>Status</th></tr>
          </thead>
          <tbody>
            {filtered.map(s => (
              <tr key={s.id}>
                <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{s.id}</td>
                <td style={{ fontWeight: 600 }}>{s.name}</td>
                <td>{s.branch}</td>
                <td>{s.sem} / {s.section}</td>
                <td>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button 
                      onClick={() => setMarked(p => ({...p, [s.id]: true}))}
                      style={{ 
                        width: 32, height: 32, borderRadius: 6, border: 'none',
                        background: marked[s.id] === true ? '#34D399' : 'rgba(255,255,255,0.05)',
                        color: marked[s.id] === true ? 'white' : '#64748B', cursor: 'pointer', fontWeight: 800
                      }}
                    >P</button>
                    <button 
                      onClick={() => setMarked(p => ({...p, [s.id]: false}))}
                      style={{ 
                        width: 32, height: 32, borderRadius: 6, border: 'none',
                        background: marked[s.id] === false ? '#EF4444' : 'rgba(255,255,255,0.05)',
                        color: marked[s.id] === false ? 'white' : '#64748B', cursor: 'pointer', fontWeight: 800
                      }}
                    >A</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ─── STUDENT MANAGEMENT MODULE ──────────────────────────────────────────────
window.StudentManagementModule = function StudentManagementModule() {
  const [search, setSearch] = useState('');
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudents = async () => {
      const { data, error } = await supabase.from('students').select('*').order('name');
      if (data) setStudents(data);
      if (error) console.error(error);
      setLoading(false);
    };
    fetchStudents();
  }, []);
  
  const filtered = students.filter(s => 
    (s.name && s.name.toLowerCase().includes(search.toLowerCase())) || 
    (s.enrollment_number && s.enrollment_number.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="page-enter" style={{ padding: 24 }}>
      <h2 className="font-syne" style={{ fontSize: 20, fontWeight: 800, marginBottom: 20 }}>Student Management (Live)</h2>
      <div style={{ marginBottom: 20 }}>
        <input 
          className="input-field" 
          placeholder="Search students by name or ID..." 
          value={search} 
          onChange={e => setSearch(e.target.value)}
          style={{ maxWidth: 400 }}
        />
      </div>
      <div className="glass-card" style={{ overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 20, textAlign: 'center', color: '#64748B' }}>Loading live data from Supabase...</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr><th>ID</th><th>Name</th><th>Branch</th><th>Semester</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.map(s => (
                <tr key={s.id}>
                  <td style={{ fontSize: 12 }}>{s.enrollment_number}</td>
                  <td style={{ fontWeight: 600 }}>{s.name}</td>
                  <td>{s.department}</td>
                  <td>Sem {s.semester}</td>
                  <td><span className={`badge badge-mint`}>Active</span></td>
                  <td>
                    <button className="btn-outline" style={{ fontSize: 11 }} onClick={() => notify(`Viewing records for ${s.name}...`)}>Full File</button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: 20 }}>No students found in Supabase.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

// ─── GRADEBOOK MODULE ────────────────────────────────────────────────────────
window.GradeBookModule = function GradeBookModule() {
  const d = window.OrchestraData;
  const subjects = ['Data Structures', 'Algorithms', 'Machine Learning'];
  
  return (
    <div className="page-enter" style={{ padding: 24 }}>
      <h2 className="font-syne" style={{ fontSize: 20, fontWeight: 800, marginBottom: 20 }}>Gradebook</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
        {subjects.map(sub => (
          <div key={sub} className="glass-card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 16, marginBottom: 12 }}>{sub}</h3>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 20 }}>Class: IV Sem / Section A</div>
            <button className="btn-primary" style={{ width: '100%' }} onClick={() => notify(`Opening marks entry for ${sub}...`)}>Enter Marks</button>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── ADMIN USER CONTROL ──────────────────────────────────────────────────────
window.UserControlModule = function UserControlModule() {
  return (
    <div className="page-enter" style={{ padding: 24 }}>
      <h2 className="font-syne" style={{ fontSize: 20, fontWeight: 800, marginBottom: 20 }}>User & Access Control</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div className="glass-card" style={{ padding: 24 }}>
          <h4 style={{ marginBottom: 16 }}>Register New User</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <input className="input-field" placeholder="Full Name" />
            <select className="input-field"><option>Student</option><option>Faculty</option><option>Staff</option></select>
            <button className="btn-primary" onClick={() => notify('User registration initiated...')}>Create Account</button>
          </div>
        </div>
        <div className="glass-card" style={{ padding: 24 }}>
          <h4 style={{ marginBottom: 16 }}>Recent Activity</h4>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>No recent permission changes.</div>
        </div>
      </div>
    </div>
  );
};

// ─── ADMIN FINANCIALS (ADD FEES/NOC) ──────────────────────────────────────────
window.FinancialsModule = function FinancialsModule() {
  const [feeData, setFeeData] = useState({ id: '', type: 'Tuition Fee', amount: '', dueDate: '' });

  return (
    <div className="page-enter" style={{ padding: 24, overflowY: 'auto', height: '100%' }}>
      <h2 className="font-syne" style={{ fontSize: 20, fontWeight: 800, marginBottom: 20 }}>Financial Management</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 24 }}>
        
        {/* ADD FEES SECTION */}
        <div className="glass-card" style={{ padding: 24 }}>
          <h4 style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 18 }}>💳</span> Generate Fee Demand
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', display: 'block', marginBottom: 6, letterSpacing: '0.5px' }}>STUDENT ID</label>
              <input 
                className="input-field" 
                placeholder="e.g. 24EJIAI142" 
                value={feeData.id}
                onChange={e => setFeeData(p => ({...p, id: e.target.value}))}
              />
            </div>
            
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', display: 'block', marginBottom: 6, letterSpacing: '0.5px' }}>FEE TYPE</label>
              <select 
                className="input-field" 
                value={feeData.type}
                onChange={e => setFeeData(p => ({...p, type: e.target.value}))}
              >
                <option value="Tuition Fee">Tuition Fee</option>
                <option value="Hostel Fee">Hostel Fee</option>
                <option value="Bus Fee">Bus Fee</option>
                <option value="Examination Fee">Examination Fee</option>
                <option value="Library Fine">Library Fine</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', display: 'block', marginBottom: 6, letterSpacing: '0.5px' }}>AMOUNT (₹)</label>
              <input 
                type="number"
                className="input-field" 
                placeholder="0.00" 
                value={feeData.amount}
                onChange={e => setFeeData(p => ({...p, amount: e.target.value}))}
              />
            </div>

            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', display: 'block', marginBottom: 6, letterSpacing: '0.5px' }}>DUE DATE</label>
              <input 
                type="date"
                className="input-field" 
                value={feeData.dueDate}
                onChange={e => setFeeData(p => ({...p, dueDate: e.target.value}))}
              />
            </div>
          </div>
          <button 
            className="btn-primary" 
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
            onClick={() => notify(`${feeData.type} demand of ₹${feeData.amount} generated for ${feeData.id || 'Student'}!`)}
          >
            Generate & Notify Student
          </button>
        </div>

        {/* ISSUANCE SECTION */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div className="glass-card" style={{ padding: 24 }}>
            <h4 style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 18 }}>📄</span> Document Issuance (NOC)
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input className="input-field" placeholder="Student ID" />
              <select className="input-field">
                <option>No Objection Certificate (NOC)</option>
                <option>Character Certificate</option>
                <option>Fee Receipt</option>
              </select>
              <button className="btn-outline" onClick={() => notify('Document signed and ready for download!')}>Issue Document</button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="glass-card" style={{ padding: 20, background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.05))' }}>
            <h4 style={{ fontSize: 13, color: '#94A3B8', marginBottom: 12 }}>TODAY'S COLLECTION</h4>
            <div style={{ fontSize: 28, fontWeight: 900, color: '#34D399', fontFamily: 'Syne, sans-serif' }}>₹4,52,000</div>
            <div style={{ fontSize: 12, color: '#64748B', marginTop: 4 }}>+12% from yesterday</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── ADMIN CAMPUS CONFIG ─────────────────────────────────────────────────────
window.CampusConfigModule = function CampusConfigModule() {
  return (
    <div className="page-enter" style={{ padding: 24 }}>
      <h2 className="font-syne" style={{ fontSize: 20, fontWeight: 800, marginBottom: 20 }}>Campus Configuration</h2>
      <div className="glass-card" style={{ padding: 24 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, display: 'block', marginBottom: 8 }}>CURRENT SEMESTER</label>
            <select className="input-field"><option>Odd Semester 2024</option><option>Even Semester 2025</option></select>
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, display: 'block', marginBottom: 8 }}>ADMISSION STATUS</label>
            <button className="btn-success" style={{ width: '100%' }}>Open for Applications</button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── ADMIN SYSTEM REPORTS ─────────────────────────────────────────────────────
window.SystemReportsModule = function SystemReportsModule() {
  return (
    <div className="page-enter" style={{ padding: 24 }}>
      <h2 className="font-syne" style={{ fontSize: 20, fontWeight: 800, marginBottom: 20 }}>Institutional Reports</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
        {['Enrollment Report', 'Revenue Report', 'Attendance Summary'].map(r => (
          <div key={r} className="glass-card" style={{ padding: 20, textAlign: 'center' }}>
            <div style={{ fontSize: 24, marginBottom: 12 }}>📊</div>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12 }}>{r}</div>
            <button className="btn-outline" style={{ fontSize: 11 }} onClick={() => notify(`Generating ${r}...`)}>Download PDF</button>
          </div>
        ))}
      </div>
    </div>
  );
};



// ─── STUDENT ATTENDANCE MODULE ──────────────────────────────────────────────
window.StudentAttendanceModule = function StudentAttendanceModule() {
  const d = window.OrchestraData;
  const [sem, setSem] = useState('IV');
  
  const semAttendanceMap = useMemo(() => {
    const map = {};
    ['I','II','III','IV','V','VI','VII','VIII'].forEach((s, i) => {
      map[s] = d.courses.map(c => {
        const total = Math.floor(Math.random() * 20) + 30; // 30-50 classes
        const attended = Math.floor(total * (s === 'IV' ? (Math.random() * 0.2 + 0.75) : (Math.random() * 0.4 + 0.55))); 
        const pct = Math.round((attended / total) * 100);
        return {
          code: `${c.code.slice(0,2)}${i+1}0${c.code.slice(-1)}`,
          name: c.name,
          total,
          attended,
          pct
        };
      });
    });
    return map;
  }, [d.courses]);

  const [records, setRecords] = useState(semAttendanceMap['IV']);
  
  useEffect(() => {
    setRecords(semAttendanceMap[sem]);
  }, [sem, semAttendanceMap]);

  const overallTotal = records.reduce((a,c)=>a+c.total, 0);
  const overallAttended = records.reduce((a,c)=>a+c.attended, 0);
  const overallPct = Math.round((overallAttended / overallTotal) * 100) || 0;
  const overallColor = overallPct < 75 ? '#EF4444' : overallPct < 85 ? '#F59E0B' : '#34D399';

  return (
    <div className="page-enter" style={{overflowY:'auto',height:'100%',padding:'24px 28px'}}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 className="font-syne" style={{ fontSize: 22, fontWeight: 800, color: '#fff', marginBottom: 4 }}>My Attendance</h2>
          <p style={{ fontSize: 13, color: '#64748B' }}>Track your subject-wise presence and verify semester eligibility.</p>
        </div>
      </div>

      <div style={{display:'flex',gap:6,marginBottom:24,flexWrap:'wrap'}}>
        {['I','II','III','IV','V','VI','VII','VIII'].map(s => (
          <button key={s} onClick={()=>setSem(s)} style={{padding:'6px 16px',borderRadius:7,fontSize:12,fontWeight:600,border:'1px solid rgba(99,102,241,.2)',background:sem===s?'linear-gradient(135deg,#6366F1,#8B5CF6)':'transparent',color:sem===s?'#fff':'#64748B',cursor:'pointer',transition:'all .2s',fontFamily:'DM Sans,sans-serif'}}>
            Sem {s}
          </button>
        ))}
      </div>

      <div className="glass-card" style={{padding:'20px 24px',marginBottom:24,display:'flex',alignItems:'center',gap:24, borderLeft: `4px solid ${overallColor}`}}>
        <div style={{ flex: 1 }}>
          <h3 style={{ fontSize: 13, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>Overall Aggregate (Sem {sem})</h3>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12 }}>
            <span style={{ fontSize: 32, fontWeight: 900, color: overallColor, fontFamily: 'Syne, sans-serif' }}>{overallPct}%</span>
            <span style={{ fontSize: 13, color: '#64748B', paddingBottom: 6 }}>{overallAttended} / {overallTotal} Classes Attended</span>
          </div>
        </div>
        {overallPct < 75 && (
           <div style={{ padding: '10px 16px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, color: '#EF4444', fontSize: 12, fontWeight: 600 }}>
             ⚠️ Warning: Minimum 75% required to sit for exams.
           </div>
        )}
      </div>

      <div className="glass-card" style={{overflow:'hidden'}}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Course Code</th>
              <th>Course Name</th>
              <th style={{textAlign:'center'}}>Total Classes</th>
              <th style={{textAlign:'center'}}>Attended</th>
              <th style={{width:160}}>Percentage</th>
            </tr>
          </thead>
          <tbody>
            {records.map(r => (
              <tr key={r.code}>
                <td><span style={{fontFamily:'monospace',color:'#E43F3F',fontWeight:600}}>{r.code}</span></td>
                <td style={{fontWeight:500,color:'#E2E8F0'}}>{r.name}</td>
                <td style={{textAlign:'center',color:'#94A3B8'}}>{r.total}</td>
                <td style={{textAlign:'center',color:'#E2E8F0',fontWeight:600}}>{r.attended}</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: r.pct < 75 ? '#EF4444' : r.pct < 85 ? '#F59E0B' : '#34D399', width: 35 }}>{r.pct}%</span>
                    <div style={{ flex: 1, height: 6, background: 'rgba(255,255,255,0.05)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ width: `${r.pct}%`, height: '100%', background: r.pct < 75 ? '#EF4444' : r.pct < 85 ? '#F59E0B' : '#34D399', borderRadius: 3 }} />
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ─── COURSE REGISTRATION MODULE ──────────────────────────────────────────────
window.CoursesModule = function CoursesModule() {
  
  const d = window.OrchestraData;
  const [sem, setSem] = useState('IV');
  
  // Create sem-specific courses dynamically for demo purposes
  const semCoursesMap = useMemo(() => {
    const map = {};
    ['I','II','III','IV','V','VI','VII','VIII'].forEach((s, i) => {
      // Seed slightly different data per sem
      map[s] = d.courses.map(c => ({
        ...c,
        code: `${c.code.slice(0,2)}${i+1}0${c.code.slice(-1)}`,
        registered: s === 'IV' ? c.registered : (Math.random() > 0.7), // Randomize registration for other sems
        attendance: Math.floor(Math.random() * 30) + 70 // Random attendance 70-99%
      }));
    });
    return map;
  }, [d.courses]);

  const [courses, setCourses] = useState(semCoursesMap['IV']);
  
  // When sem changes, load that semester's data
  useEffect(() => {
    setCourses(semCoursesMap[sem]);
  }, [sem, semCoursesMap]);

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const maxCredits = 24;
  const deadline = "May 15, 2025";

  const registered = courses.filter(c => c.registered);
  const usedCredits = registered.reduce((a,c) => a+c.credits, 0);
  const creditPct = (usedCredits/maxCredits)*100;
  const creditColor = creditPct > 85 ? '#EF4444' : creditPct > 65 ? '#F59E0B' : '#34D399';

  const available = useMemo(() => courses.filter(c =>
    !c.registered &&
    (filter === 'All' || c.type === filter) &&
    (c.name.toLowerCase().includes(search.toLowerCase()) || c.code.toLowerCase().includes(search.toLowerCase()))
  ), [courses, search, filter]);

  const toggle = (code, add) => {
    setCourses(prev => prev.map(c => c.code===code ? {...c, registered:add} : c));
    semCoursesMap[sem] = semCoursesMap[sem].map(c => c.code===code ? {...c, registered:add} : c);
  };

  const typeColor = { Core:'badge-indigo', Elective:'badge-rose', Lab:'badge-amber' };

  return (
    <div className="page-enter" style={{overflowY:'auto',height:'100%',padding:'24px 28px'}}>
      {/* Deadline banner */}
      <div style={{background:'linear-gradient(135deg,rgba(99,102,241,.15),rgba(139,92,246,.1))',border:'1px solid rgba(99,102,241,.25)',borderRadius:10,padding:'12px 20px',marginBottom:22,display:'flex',alignItems:'center',gap:12}}>
        <span style={{fontSize:20}}>⏰</span>
        <div>
          <div style={{fontSize:13,fontWeight:600,color:'#E43F3F'}}>Registration Deadline: {deadline}</div>
          <div style={{fontSize:11,color:'#64748B'}}>Ensure you meet the minimum credit requirement of 18 credits before the deadline.</div>
        </div>
      </div>

      {/* Semester tabs */}
      <div style={{display:'flex',gap:6,marginBottom:22,flexWrap:'wrap'}}>
        {['I','II','III','IV','V','VI','VII','VIII'].map(s => (
          <button key={s} onClick={()=>setSem(s)} style={{padding:'6px 16px',borderRadius:7,fontSize:12,fontWeight:600,border:'1px solid rgba(99,102,241,.2)',background:sem===s?'linear-gradient(135deg,#6366F1,#8B5CF6)':'transparent',color:sem===s?'#fff':'#64748B',cursor:'pointer',transition:'all .2s',fontFamily:'DM Sans,sans-serif'}}>
            Sem {s}
          </button>
        ))}
      </div>

      {/* Credit load meter */}
      <div className="glass-card" style={{padding:'16px 20px',marginBottom:22,display:'flex',alignItems:'center',gap:20}}>
        <div style={{flex:1}}>
          <div style={{display:'flex',justifyContent:'space-between',fontSize:12,marginBottom:8}}>
            <span style={{color:'#94A3B8',fontWeight:600}}>Credit Load</span>
            <span style={{color:creditColor,fontWeight:700,fontSize:14}}>{usedCredits} / {maxCredits} Credits</span>
          </div>
          <div className="progress-bar" style={{height:10}}>
            <div className="progress-fill" style={{width:`${Math.min(creditPct,100)}%`,background:`linear-gradient(90deg,${creditColor},${creditColor}AA)`,transition:'width .6s ease'}}/>
          </div>
          <div style={{fontSize:11,color:'#475569',marginTop:5}}>
            {creditPct>85?'⚠️ Near maximum load':'✅ Within safe limit'} — {maxCredits-usedCredits} credits remaining
          </div>
        </div>
        <div style={{textAlign:'center',padding:'8px 16px',background:'rgba(99,102,241,.1)',borderRadius:10,border:'1px solid rgba(99,102,241,.2)'}}>
          <div style={{fontSize:28,fontWeight:800,fontFamily:'Syne,sans-serif',color:creditColor}}>{usedCredits}</div>
          <div style={{fontSize:10,color:'#64748B',textTransform:'uppercase',letterSpacing:'.5px'}}>Credits</div>
        </div>
      </div>

      {/* Registered courses */}
      <h3 className="font-syne" style={{fontSize:14,fontWeight:700,color:'#94A3B8',textTransform:'uppercase',letterSpacing:'.8px',marginBottom:12}}>Registered Courses ({registered.length})</h3>
      <div className="glass-card" style={{marginBottom:24,overflow:'hidden'}}>
        <table className="data-table">
          <thead><tr><th>Code</th><th>Course Name</th><th>Credits</th><th>Faculty</th><th>Type</th><th>Attendance</th><th>Action</th></tr></thead>
          <tbody>
            {registered.map(c => (
              <tr key={c.code}>
                <td><span style={{fontFamily:'monospace',color:'#E43F3F',fontWeight:600}}>{c.code}</span></td>
                <td style={{fontWeight:500,color:'#E2E8F0'}}>{c.name}</td>
                <td><span style={{fontWeight:700,color:'#34D399'}}>{c.credits}</span></td>
                <td style={{color:'#94A3B8'}}>{c.faculty}</td>
                <td><span className={`badge ${typeColor[c.type]}`}>{c.type}</span></td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: c.attendance < 75 ? '#EF4444' : '#34D399' }}>{c.attendance}%</div>
                    <div style={{ width: 40, height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 2 }}>
                      <div style={{ width: `${c.attendance}%`, height: '100%', background: c.attendance < 75 ? '#EF4444' : '#34D399', borderRadius: 2 }} />
                    </div>
                  </div>
                </td>
                <td><button className="btn-danger" onClick={()=>toggle(c.code,false)}>Remove</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Search & filter */}
      <h3 className="font-syne" style={{fontSize:14,fontWeight:700,color:'#94A3B8',textTransform:'uppercase',letterSpacing:'.8px',marginBottom:12}}>Available Courses</h3>
      <div style={{display:'flex',gap:10,marginBottom:14}}>
        <input className="input-field" style={{flex:1}} placeholder="🔍  Search by course name or code…" value={search} onChange={e=>setSearch(e.target.value)}/>
        <div style={{display:'flex',gap:6}}>
          {['All','Core','Elective','Lab'].map(f => (
            <button key={f} onClick={()=>setFilter(f)} style={{padding:'8px 14px',borderRadius:7,fontSize:12,fontWeight:600,border:'1px solid rgba(99,102,241,.2)',background:filter===f?'rgba(99,102,241,.2)':'transparent',color:filter===f?'#E43F3F':'#64748B',cursor:'pointer',fontFamily:'DM Sans,sans-serif',transition:'all .2s'}}>
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="glass-card" style={{overflow:'hidden'}}>
        <table className="data-table">
          <thead><tr><th>Code</th><th>Course Name</th><th>Credits</th><th>Faculty</th><th>Slots Left</th><th>Type</th><th>Action</th></tr></thead>
          <tbody>
            {available.map(c => (
              <tr key={c.code}>
                <td><span style={{fontFamily:'monospace',color:'#E43F3F',fontWeight:600}}>{c.code}</span></td>
                <td style={{fontWeight:500,color:'#E2E8F0'}}>{c.name}</td>
                <td><span style={{fontWeight:700,color:'#6366F1'}}>{c.credits}</span></td>
                <td style={{color:'#94A3B8'}}>{c.faculty}</td>
                <td>
                  <span style={{color:c.slots===0?'#EF4444':c.slots<8?'#F59E0B':'#34D399',fontWeight:600}}>
                    {c.slots===0?'Full':c.slots}
                  </span>
                </td>
                <td><span className={`badge ${typeColor[c.type]}`}>{c.type}</span></td>
                <td>
                  <button
                    className={c.slots===0||usedCredits+c.credits>maxCredits?'btn-outline':'btn-success'}
                    disabled={c.slots===0||usedCredits+c.credits>maxCredits}
                    onClick={()=>toggle(c.code,true)}
                    style={{opacity:c.slots===0?0.4:1}}
                  >
                    {c.slots===0?'Full':'Enroll'}
                  </button>
                </td>
              </tr>
            ))}
            {available.length===0 && <tr><td colSpan={7} style={{textAlign:'center',color:'#475569',padding:'30px'}}>No courses match your search.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};



// ─── ADMISSIONS MANAGEMENT MODULE ───────────────────────────────────────────
window.AdmissionsModule = function AdmissionsModule({ userRole }) {
  const d = window.OrchestraData;
  const isAdmin = userRole === 'admin';
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [docs, setDocs] = useState(d.documents.map(doc => ({ ...doc })));

  const filteredApplicants = d.applicants?.filter(a => a.name.toLowerCase().includes(search.toLowerCase())) || [];
  const steps = d.admissionSteps;
  const current = selected ? (selected.status === 'Verified' ? 4 : 3) : d.currentStep;

  if (isAdmin && !selected) {
    return (
      <div className="page-enter" style={{ padding: 24, overflowY: 'auto' }}>
        <h2 className="font-syne" style={{ fontSize: 22, fontWeight: 800, marginBottom: 6 }}>Applicant Explorer</h2>
        <p style={{ fontSize: 13, color: '#64748B', marginBottom: 28 }}>Search and track all active university applications.</p>
        
        <div style={{ marginBottom: 24 }}>
          <input 
            className="input-field" 
            placeholder="🔍 Search applicant by name..." 
            value={search} 
            onChange={e => setSearch(e.target.value)}
            style={{ maxWidth: 500 }}
          />
        </div>

        <div className="glass-card" style={{ overflow: 'hidden' }}>
          <table className="data-table">
            <thead>
              <tr><th>Applicant</th><th>Branch</th><th>Admission Type</th><th>Status</th><th>Applied Date</th><th>Action</th></tr>
            </thead>
            <tbody>
              {filteredApplicants.map(a => (
                <tr key={a.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <img src={a.photo} style={{ width: 32, height: 32, borderRadius: 8, objectFit: 'cover' }} />
                      <div style={{ fontWeight: 600 }}>{a.name}</div>
                    </div>
                  </td>
                  <td>{a.branch}</td>
                  <td>
                    <span className={`badge ${a.type === 'Scholarship' ? 'badge-rose' : 'badge-amber'}`}>
                      {a.type}
                    </span>
                  </td>
                  <td><span className={`badge ${a.status === 'Verified' ? 'badge-mint' : 'badge-amber'}`}>{a.status}</span></td>
                  <td style={{ fontSize: 12, color: '#64748B' }}>{a.date}</td>
                  <td><button className="btn-outline" onClick={() => setSelected(a)}>Full Details</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="page-enter" style={{overflowY:'auto',height:'100%',padding:'24px 28px'}}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div>
          <h2 className="font-syne" style={{fontSize:22,fontWeight:800,color:'#fff',marginBottom:6}}>
            {isAdmin ? `Application Detail: ${selected.name}` : 'Admissions Management'}
          </h2>
          <p style={{fontSize:13,color:'#64748B'}}>
            {isAdmin ? `Tracking ID: ${selected.id}` : 'Track your admission progress and manage required documents.'}
          </p>
        </div>
        {isAdmin && <button className="btn-outline" onClick={() => setSelected(null)}>Back to List</button>}
      </div>

      {isAdmin && (
        <div className="glass-card" style={{ padding: 16, marginBottom: 24, display: 'flex', gap: 20, alignItems: 'center', borderLeft: `4px solid ${selected.type === 'Scholarship' ? '#F43F5E' : '#F59E0B'}` }}>
          <img src={selected.photo} style={{ width: 64, height: 64, borderRadius: 12, objectFit: 'cover' }} />
          <div>
            <div style={{ fontSize: 18, fontWeight: 800 }}>{selected.name}</div>
            <div style={{ fontSize: 12, color: '#94A3B8' }}>{selected.type} Applicant • {selected.branch} Department</div>
          </div>
          <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
            <div style={{ fontSize: 11, color: '#64748B' }}>Verified status:</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#34D399' }}>{selected.status}</div>
          </div>
        </div>
      )}

      {/* Progress Stepper */}
      <div className="glass-card" style={{padding:'28px 32px',marginBottom:28}}>
        <h3 className="font-syne" style={{fontSize:13,fontWeight:700,color:'#94A3B8',textTransform:'uppercase',letterSpacing:'.8px',marginBottom:24}}>Admission Progress</h3>
        <div style={{display:'flex',alignItems:'center'}}>
          {steps.map((step, i) => {
            const done = i < current;
            const active = i === current;
            return (
              <React.Fragment key={i}>
                <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:8,minWidth:80}}>
                  <div style={{
                    width:40, height:40, borderRadius:'50%',
                    background: done ? 'linear-gradient(135deg,#34D399,#10B981)' : active ? 'linear-gradient(135deg,#6366F1,#8B5CF6)' : 'rgba(26,29,40,.9)',
                    border: `2px solid ${done?'#34D399':active?'#6366F1':'rgba(99,102,241,.2)'}`,
                    display:'flex',alignItems:'center',justifyContent:'center',
                    fontSize:14,fontWeight:700,color: (done||active)?'#fff':'#475569',
                    position:'relative',
                  }}>
                    {done ? '✓' : i+1}
                  </div>
                  <div style={{fontSize:11,color:done?'#34D399':active?'#6366F1':'#475569',textAlign:'center',fontWeight:active?600:400,maxWidth:80}}>{step}</div>
                </div>
                {i < steps.length-1 && (
                  <div className={`step-connector ${i < current ? 'done' : ''}`} style={{marginBottom:28}}/>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
      
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:24}}>
        <div className="glass-card" style={{padding:24}}>
          <h3 className="font-syne" style={{fontSize:14,fontWeight:700,color:'#94A3B8',textTransform:'uppercase',letterSpacing:'.8px',marginBottom:16}}>Applicant Documents</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {Object.entries(selected?.docs || { "10th Marksheet": "verified", "12th Marksheet": "verified", "Aadhar Card": "verified" }).map(([name, status]) => (
              <div key={name} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(255,255,255,0.02)', borderRadius: 8 }}>
                <span style={{ fontSize: 13 }}>{name}</span>
                <span className={`badge ${status==='verified'?'badge-mint':'badge-amber'}`}>{status}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="glass-card" style={{ padding: 24 }}>
          <h4 style={{ marginBottom: 16 }}>Internal Admin Notes</h4>
          <textarea className="input-field" style={{ width: '100%', height: 100, background: 'rgba(0,0,0,0.2)' }} placeholder="Add evaluation notes here..." />
          <button className="btn-primary" style={{ marginTop: 12, width: '100%' }} onClick={() => notify('Notes saved successfully!')}>Save Evaluation</button>
        </div>
      </div>
    </div>
  );
};



// ─── FEE RECORDS & PAYMENTS MODULE ──────────────────────────────────────────
window.FeesModule = function FeesModule() {
  const d = window.OrchestraData.fees;
  

  const statusStyle = {
    paid: { badge:'badge-mint', label:'Paid' },
    pending: { badge:'badge-amber', label:'Pending' },
    overdue: { badge:'badge-red', label:'Overdue' },
  };

  return (
    <div className="page-enter" style={{overflowY:'auto',height:'100%',padding:'24px 28px'}}>
      <h2 className="font-syne" style={{fontSize:22,fontWeight:800,color:'#fff',marginBottom:6}}>Fee Records & Payments</h2>
      <p style={{fontSize:13,color:'#64748B',marginBottom:24}}>Manage your fee payments and view transaction history.</p>

      {/* Summary cards */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:14,marginBottom:28}}>
        {[
          {label:'Total Fees', val:'₹1,25,000', color:'#E43F3F', icon:'📋'},
          {label:'Amount Paid', val:'₹1,00,500', color:'#34D399', icon:'✅'},
          {label:'Pending Amount', val:'₹24,500', color:'#EF4444', icon:'⏳'},
          {label:'Due Date', val:d.dueDate, color:'#F59E0B', icon:'📅'},
        ].map((item,i) => (
          <div key={i} className="glass-card" style={{padding:'18px 20px',textAlign:'center'}}>
            <div style={{fontSize:22,marginBottom:6}}>{item.icon}</div>
            <div style={{fontSize:11,color:'#64748B',textTransform:'uppercase',letterSpacing:'.6px',marginBottom:6}}>{item.label}</div>
            <div style={{fontSize:20,fontWeight:800,fontFamily:'Syne,sans-serif',color:item.color}}>{item.val}</div>
          </div>
        ))}
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 340px',gap:24,marginBottom:28}}>
        {/* Transaction history */}
        <div className="glass-card" style={{overflow:'hidden'}}>
          <div style={{padding:'16px 20px',borderBottom:'1px solid rgba(99,102,241,.12)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <h3 className="font-syne" style={{fontSize:14,fontWeight:700,color:'#94A3B8',textTransform:'uppercase',letterSpacing:'.8px'}}>Transaction History</h3>
            <button className="btn-outline" style={{fontSize:11}}>⬇ Download</button>
          </div>
          <table className="data-table">
            <thead>
              <tr><th>Date</th><th>Description</th><th>Amount</th><th>Mode</th><th>Status</th><th>Action</th></tr>
            </thead>
            <tbody>
              {d.transactions.map((tx,i) => (
                <tr key={i}>
                  <td style={{color:'#64748B',fontSize:12}}>{tx.date}</td>
                  <td style={{color:'#E2E8F0',fontWeight:500}}>{tx.desc}</td>
                  <td style={{fontWeight:700,color:tx.status==='paid'?'#34D399':tx.status==='overdue'?'#EF4444':'#F59E0B',fontFamily:'Syne,sans-serif'}}>₹{tx.amount.toLocaleString()}</td>
                  <td style={{color:'#64748B',fontSize:12}}>{tx.mode}</td>
                  <td><span className={`badge ${statusStyle[tx.status].badge}`}>{statusStyle[tx.status].label}</span></td>
                  <td>
                    {tx.status !== 'paid' && (
                      <button className="btn-primary" style={{padding:'5px 12px',fontSize:11}}>Pay Now</button>
                    )}
                    {tx.status === 'paid' && (
                      <button className="btn-outline" style={{padding:'5px 12px',fontSize:11}}>Receipt</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Donut chart */}
        <div className="glass-card" style={{padding:24,display:'flex',flexDirection:'column'}}>
          <h3 className="font-syne" style={{fontSize:14,fontWeight:700,color:'#94A3B8',textTransform:'uppercase',letterSpacing:'.8px',marginBottom:4}}>Fee Breakdown</h3>
          <p style={{fontSize:12,color:'#475569',marginBottom:16}}>Academic Year 2024–25</p>
          <div style={{flex:1,minHeight:200}}>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={d.breakdown} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                  {d.breakdown.map((entry,i) => <Cell key={i} fill={entry.color} stroke="transparent"/>)}
                </Pie>
                <Tooltip
                  contentStyle={{background:'#13161E',border:'1px solid rgba(99,102,241,.25)',borderRadius:8,fontSize:12}}
                  formatter={(v)=>[`₹${v.toLocaleString()}`,'']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:8,marginTop:8}}>
            {d.breakdown.map((item,i) => (
              <div key={i} style={{display:'flex',alignItems:'center',gap:10,justifyContent:'space-between'}}>
                <div style={{display:'flex',alignItems:'center',gap:8}}>
                  <div className="legend-dot" style={{background:item.color}}/>
                  <span style={{fontSize:12,color:'#94A3B8'}}>{item.name}</span>
                </div>
                <span style={{fontSize:12,fontWeight:600,color:'#E2E8F0'}}>₹{item.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pay pending button */}
      <div style={{background:'linear-gradient(135deg,rgba(239,68,68,.1),rgba(220,38,38,.05))',border:'1px solid rgba(239,68,68,.25)',borderRadius:12,padding:'20px 24px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <div>
          <div style={{fontSize:14,fontWeight:600,color:'#FCA5A5'}}>Outstanding Balance</div>
          <div style={{fontSize:11,color:'#64748B'}}>2 pending payments · Due: {d.dueDate}</div>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:16}}>
          <div style={{fontSize:24,fontWeight:800,fontFamily:'Syne,sans-serif',color:'#EF4444'}}>₹24,500</div>
          <button className="btn-primary" style={{background:'linear-gradient(135deg,#EF4444,#DC2626)',padding:'11px 24px',fontSize:13,boxShadow:'0 4px 20px rgba(239,68,68,.35)'}}>
            Pay All Pending →
          </button>
        </div>
      </div>
    </div>
  );
};



// ─── ATTENDANCE TRACKER MODULE ────────────────────────────────────────────────
window.AttendanceModule = function AttendanceModule() {
  
  const d = window.OrchestraData;
  const [showModal, setShowModal] = useState(false);
  const [leaveForm, setLeaveForm] = useState({ from:'', to:'', reason:'' });
  const [circPct, setCircPct] = useState(0);

  const subjects = d.attendance.map(s => ({
    ...s,
    pct: Math.round((s.present/s.total)*100),
  }));

  const overall = Math.round(subjects.reduce((a,s) => a + s.pct, 0) / subjects.length);

  useEffect(() => {
    const t = setTimeout(() => setCircPct(overall), 300);
    return () => clearTimeout(t);
  }, []);

  // SVG circle
  const r = 54, circ = 2 * Math.PI * r;
  const dash = (circPct / 100) * circ;
  const circColor = circPct >= 75 ? '#34D399' : circPct >= 65 ? '#F59E0B' : '#EF4444';

  const statusBadge = (pct) => pct >= 75 ? {label:'Safe', cls:'badge-mint'} : pct >= 65 ? {label:'Warning', cls:'badge-amber'} : {label:'Danger', cls:'badge-red'};

  // Calendar
  const calColors = { 0:'rgba(26,29,40,.4)', 1:'rgba(52,211,153,.2)', 2:'rgba(239,68,68,.2)', 3:'rgba(245,158,11,.2)' };
  const calText = { 0:'#475569', 1:'#34D399', 2:'#EF4444', 3:'#F59E0B' };
  const monthDays = d.calendarData;

  return (
    <div className="page-enter" style={{overflowY:'auto',height:'100%',padding:'24px 28px'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:24}}>
        <div>
          <h2 className="font-syne" style={{fontSize:22,fontWeight:800,color:'#fff',marginBottom:4}}>Attendance Tracker</h2>
          <p style={{fontSize:13,color:'#64748B'}}>Subject-wise and overall attendance for Semester IV</p>
        </div>
        <button className="btn-primary" onClick={()=>setShowModal(true)}>📝 Apply Leave</button>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 260px',gap:24,marginBottom:28}}>
        {/* Subject table */}
        <div className="glass-card" style={{overflow:'hidden'}}>
          <div style={{padding:'14px 20px',borderBottom:'1px solid rgba(99,102,241,.12)'}}>
            <h3 className="font-syne" style={{fontSize:13,fontWeight:700,color:'#94A3B8',textTransform:'uppercase',letterSpacing:'.8px'}}>Subject-wise Attendance</h3>
          </div>
          <table className="data-table">
            <thead><tr><th>Subject</th><th>Total</th><th>Present</th><th>Absent</th><th>%</th><th>Status</th></tr></thead>
            <tbody>
              {subjects.map((s,i) => {
                const st = statusBadge(s.pct);
                return (
                  <tr key={i}>
                    <td style={{fontWeight:500,color:'#E2E8F0',maxWidth:220}}>{s.subject}</td>
                    <td style={{color:'#64748B'}}>{s.total}</td>
                    <td style={{color:'#34D399',fontWeight:600}}>{s.present}</td>
                    <td style={{color:'#EF4444',fontWeight:600}}>{s.total-s.present}</td>
                    <td>
                      <div style={{display:'flex',alignItems:'center',gap:8}}>
                        <div style={{width:48,height:5,borderRadius:3,background:'rgba(99,102,241,.12)',overflow:'hidden'}}>
                          <div style={{width:`${s.pct}%`,height:'100%',borderRadius:3,background:s.pct>=75?'#34D399':s.pct>=65?'#F59E0B':'#EF4444',transition:'width .6s ease'}}/>
                        </div>
                        <span style={{fontWeight:700,color:s.pct>=75?'#34D399':s.pct>=65?'#F59E0B':'#EF4444'}}>{s.pct}%</span>
                      </div>
                    </td>
                    <td><span className={`badge ${st.cls}`}>{st.label}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Overall circle */}
        <div style={{display:'flex',flexDirection:'column',gap:16}}>
          <div className="glass-card" style={{padding:24,display:'flex',flexDirection:'column',alignItems:'center'}}>
            <h3 className="font-syne" style={{fontSize:13,fontWeight:700,color:'#94A3B8',textTransform:'uppercase',letterSpacing:'.8px',marginBottom:16}}>Overall Attendance</h3>
            <div style={{position:'relative',width:130,height:130}}>
              <svg width="130" height="130" viewBox="0 0 130 130">
                <circle cx="65" cy="65" r={r} fill="none" stroke="rgba(99,102,241,.1)" strokeWidth="10"/>
                <circle cx="65" cy="65" r={r} fill="none" stroke={circColor} strokeWidth="10"
                  strokeDasharray={`${dash} ${circ - dash}`}
                  strokeDashoffset={circ/4}
                  strokeLinecap="round"
                  style={{transition:'stroke-dasharray 1.2s ease'}}
                />
              </svg>
              <div style={{position:'absolute',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}}>
                <div style={{fontSize:28,fontWeight:800,fontFamily:'Syne,sans-serif',color:circColor}}>{circPct}%</div>
                <div style={{fontSize:10,color:'#64748B',textTransform:'uppercase'}}>Overall</div>
              </div>
            </div>
            <div style={{marginTop:16,display:'flex',gap:12,justifyContent:'center'}}>
              {[{label:'Safe',color:'#34D399'},{label:'Warning',color:'#F59E0B'},{label:'Danger',color:'#EF4444'}].map(l=>(
                <div key={l.label} style={{display:'flex',alignItems:'center',gap:5,fontSize:11,color:'#64748B'}}>
                  <div style={{width:8,height:8,borderRadius:'50%',background:l.color}}/>
                  {l.label}
                </div>
              ))}
            </div>
          </div>

          {/* Quick stats */}
          <div className="glass-card" style={{padding:20,display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
            {[
              {label:'Classes Attended',val:subjects.reduce((a,s)=>a+s.present,0),color:'#34D399'},
              {label:'Classes Missed',val:subjects.reduce((a,s)=>a+s.total-s.present,0),color:'#EF4444'},
              {label:'Total Classes',val:subjects.reduce((a,s)=>a+s.total,0),color:'#E43F3F'},
              {label:'Leaves Availed',val:4,color:'#F59E0B'},
            ].map((item,i) => (
              <div key={i} style={{textAlign:'center',padding:'10px 8px',background:'rgba(26,29,40,.5)',borderRadius:8}}>
                <div style={{fontSize:22,fontWeight:800,fontFamily:'Syne,sans-serif',color:item.color}}>{item.val}</div>
                <div style={{fontSize:10,color:'#64748B',marginTop:2}}>{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Calendar Heatmap */}
      <div className="glass-card" style={{padding:24}}>
        <h3 className="font-syne" style={{fontSize:13,fontWeight:700,color:'#94A3B8',textTransform:'uppercase',letterSpacing:'.8px',marginBottom:16}}>Monthly Calendar — April 2025</h3>
        <div style={{display:'flex',gap:4,flexWrap:'wrap'}}>
          {monthDays.map((status,i) => (
            <div key={i} className="cal-day" style={{background:calColors[status],color:calText[status],border:`1px solid ${status===0?'rgba(255,255,255,.03)':'transparent'}`}}>
              {i+1}
            </div>
          ))}
        </div>
        <div style={{display:'flex',gap:20,marginTop:16}}>
          {[{label:'Holiday',color:'rgba(26,29,40,.4)',text:'#475569'},{label:'Present',color:'rgba(52,211,153,.2)',text:'#34D399'},{label:'Absent',color:'rgba(239,68,68,.2)',text:'#EF4444'},{label:'Leave',color:'rgba(245,158,11,.2)',text:'#F59E0B'}].map(l=>(
            <div key={l.label} style={{display:'flex',alignItems:'center',gap:6,fontSize:12,color:'#64748B'}}>
              <div style={{width:16,height:16,borderRadius:4,background:l.color,border:'1px solid rgba(255,255,255,.05)'}}/>
              {l.label}
            </div>
          ))}
        </div>
      </div>

      {/* Leave Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&setShowModal(false)}>
          <div className="modal-box">
            <h3 className="font-syne" style={{fontSize:18,fontWeight:700,color:'#fff',marginBottom:4}}>Apply for Leave</h3>
            <p style={{fontSize:12,color:'#64748B',marginBottom:20}}>Submit a leave request for faculty approval.</p>
            <div style={{display:'flex',flexDirection:'column',gap:14}}>
              <div><label style={{fontSize:11,color:'#64748B',fontWeight:600,display:'block',marginBottom:5}}>FROM DATE</label>
                <input type="date" className="input-field" value={leaveForm.from} onChange={e=>setLeaveForm(p=>({...p,from:e.target.value}))}/>
              </div>
              <div><label style={{fontSize:11,color:'#64748B',fontWeight:600,display:'block',marginBottom:5}}>TO DATE</label>
                <input type="date" className="input-field" value={leaveForm.to} onChange={e=>setLeaveForm(p=>({...p,to:e.target.value}))}/>
              </div>
              <div><label style={{fontSize:11,color:'#64748B',fontWeight:600,display:'block',marginBottom:5}}>REASON</label>
                <textarea className="input-field" rows={3} placeholder="State reason for leave…" value={leaveForm.reason} onChange={e=>setLeaveForm(p=>({...p,reason:e.target.value}))} style={{resize:'none'}}/>
              </div>
            </div>
            <div style={{display:'flex',gap:10,marginTop:20}}>
              <button className="btn-primary" style={{flex:1}} onClick={()=>setShowModal(false)}>Submit Request</button>
              <button className="btn-outline" onClick={()=>setShowModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};



// ─── FACULTY DIRECTORY MODULE ─────────────────────────────────────────────────
window.FacultyModule = function FacultyModule() {
  
  const d = window.OrchestraData;
  const [search, setSearch] = useState('');
  const [dept, setDept] = useState('All');
  const [selected, setSelected] = useState(null);

  const depts = ['All', 'Computer Science', 'AI & ML', 'Mathematics', 'Humanities'];

  const filtered = d.faculty.filter(f =>
    (dept === 'All' || f.dept === dept) &&
    (f.name.toLowerCase().includes(search.toLowerCase()) ||
     f.dept.toLowerCase().includes(search.toLowerCase()) ||
     f.designation.toLowerCase().includes(search.toLowerCase()))
  );

  const deptColors = d.deptColors;

  const avatarColors = ['#6366F1','#34D399','#E8A87C','#F59E0B','#A78BFA','#EC4899','#14B8A6','#F97316','#8B5CF6','#06B6D4','#EF4444','#84CC16'];

  return (
    <div className="page-enter" style={{overflowY:'auto',height:'100%',padding:'24px 28px',position:'relative'}}>
      <h2 className="font-syne" style={{fontSize:22,fontWeight:800,color:'#fff',marginBottom:6}}>Faculty Directory</h2>
      <p style={{fontSize:13,color:'#64748B',marginBottom:22}}>Browse and connect with faculty members across all departments.</p>

      {/* Filters */}
      <div style={{display:'flex',gap:10,marginBottom:22,flexWrap:'wrap'}}>
        <input className="input-field" style={{width:280}} placeholder="🔍  Search faculty, department…" value={search} onChange={e=>setSearch(e.target.value)}/>
        <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
          {depts.map(d => (
            <button key={d} onClick={()=>setDept(d)} style={{padding:'8px 14px',borderRadius:7,fontSize:12,fontWeight:600,border:`1px solid ${dept===d?deptColors[d]||'#6366F1':'rgba(99,102,241,.2)'}`,background:dept===d?`${deptColors[d]||'#6366F1'}22`:'transparent',color:dept===d?deptColors[d]||'#E43F3F':'#64748B',cursor:'pointer',fontFamily:'DM Sans,sans-serif',transition:'all .2s'}}>
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16}}>
        {filtered.map((f,i) => (
          <div key={f.id} className="glass-card" style={{padding:20,cursor:'pointer',borderLeft:`3px solid ${deptColors[f.dept]||'#6366F1'}`}} onClick={()=>setSelected(f)}>
            <div style={{display:'flex',alignItems:'center',gap:14,marginBottom:14}}>
              <div style={{width:52,height:52,borderRadius:'50%',background:`linear-gradient(135deg,${avatarColors[i%12]},${avatarColors[(i+3)%12]})`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:17,fontWeight:800,color:'#fff',fontFamily:'Syne,sans-serif',flexShrink:0}}>
                {f.initials}
              </div>
              <div style={{overflow:'hidden'}}>
                <div style={{fontSize:14,fontWeight:700,color:'#E2E8F0',marginBottom:2,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{f.name}</div>
                <div style={{fontSize:11,color:'#94A3B8'}}>{f.designation}</div>
              </div>
            </div>
            <div style={{marginBottom:12}}>
              <span style={{fontSize:11,padding:'3px 10px',borderRadius:20,background:`${deptColors[f.dept]||'#6366F1'}22`,color:deptColors[f.dept]||'#E43F3F',fontWeight:600,border:`1px solid ${deptColors[f.dept]||'#6366F1'}44`}}>
                {f.dept}
              </span>
            </div>
            <div style={{fontSize:12,color:'#64748B',marginBottom:3}}>✉ {f.email}</div>
            <div style={{fontSize:12,color:'#64748B',marginBottom:14}}>📞 {f.phone}</div>
            <button className="btn-outline" style={{width:'100%',fontSize:12}} onClick={e=>{e.stopPropagation();setSelected(f);}}>
              View Profile →
            </button>
          </div>
        ))}
        {filtered.length===0 && (
          <div style={{gridColumn:'1/-1',textAlign:'center',color:'#475569',padding:'50px'}}>No faculty found.</div>
        )}
      </div>

      {/* Detail panel */}
      {selected && (
        <>
          <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.4)',zIndex:149}} onClick={()=>setSelected(null)}/>
          <div className="detail-panel">
            <div style={{padding:'24px',borderBottom:'1px solid rgba(99,102,241,.12)'}}>
              <button onClick={()=>setSelected(null)} style={{float:'right',background:'none',border:'none',color:'#64748B',cursor:'pointer',fontSize:18,lineHeight:1}}>✕</button>
              <div style={{display:'flex',gap:16,alignItems:'center',marginBottom:16}}>
                <div style={{width:64,height:64,borderRadius:'50%',background:`linear-gradient(135deg,${deptColors[selected.dept]||'#6366F1'},${deptColors[selected.dept]||'#8B5CF6'}AA)`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,fontWeight:800,color:'#fff',fontFamily:'Syne,sans-serif'}}>
                  {selected.initials}
                </div>
                <div>
                  <h3 className="font-syne" style={{fontSize:18,fontWeight:800,color:'#fff'}}>{selected.name}</h3>
                  <div style={{fontSize:12,color:'#94A3B8'}}>{selected.designation}</div>
                  <span style={{fontSize:11,padding:'2px 10px',borderRadius:20,background:`${deptColors[selected.dept]||'#6366F1'}22`,color:deptColors[selected.dept]||'#E43F3F',fontWeight:600,marginTop:5,display:'inline-block'}}>
                    {selected.dept}
                  </span>
                </div>
              </div>
            </div>
            <div style={{padding:'20px 24px',display:'flex',flexDirection:'column',gap:16}}>
              {[
                {label:'Email',val:selected.email},
                {label:'Phone',val:selected.phone},
                {label:'Experience',val:selected.exp},
                {label:'Office Hours',val:selected.hours},
              ].map(item => (
                <div key={item.label}>
                  <div style={{fontSize:10,color:'#64748B',textTransform:'uppercase',letterSpacing:'.7px',marginBottom:3}}>{item.label}</div>
                  <div style={{fontSize:13,color:'#E2E8F0'}}>{item.val}</div>
                </div>
              ))}
              <div>
                <div style={{fontSize:10,color:'#64748B',textTransform:'uppercase',letterSpacing:'.7px',marginBottom:8}}>Courses Taught</div>
                <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                  {selected.courses.map(c => <span key={c} className="badge badge-indigo">{c}</span>)}
                </div>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                <div style={{textAlign:'center',padding:14,background:'rgba(99,102,241,.08)',borderRadius:10,border:'1px solid rgba(99,102,241,.15)'}}>
                  <div style={{fontSize:24,fontWeight:800,fontFamily:'Syne,sans-serif',color:'#E43F3F'}}>{selected.pubs}</div>
                  <div style={{fontSize:11,color:'#64748B'}}>Publications</div>
                </div>
                <div style={{textAlign:'center',padding:14,background:'rgba(52,211,153,.08)',borderRadius:10,border:'1px solid rgba(52,211,153,.15)'}}>
                  <div style={{fontSize:24,fontWeight:800,fontFamily:'Syne,sans-serif',color:'#34D399'}}>{selected.exp}</div>
                  <div style={{fontSize:11,color:'#64748B'}}>Experience</div>
                </div>
              </div>
              <button className="btn-primary" style={{width:'100%',padding:'10px'}}>✉ Send Email</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};



// ─── EXAM SCHEDULE MODULE ─────────────────────────────────────────────────────
window.ExamsModule = function ExamsModule() {
  
  const d = window.OrchestraData;
  const [countdown, setCountdown] = useState({ d:0, h:0, m:0, s:0 });
  const [openAccordion, setOpenAccordion] = useState(null);

  // Next upcoming exam
  const upcoming = d.exams.filter(e => e.status==='upcoming');
  const nextExam = upcoming[0];

  useEffect(() => {
    if (!nextExam) return;
    const target = new Date(`${nextExam.date}T09:00:00`).getTime();
    const tick = () => {
      const diff = target - Date.now();
      if (diff <= 0) return;
      const dd = Math.floor(diff/86400000);
      const hh = Math.floor((diff%86400000)/3600000);
      const mm = Math.floor((diff%3600000)/60000);
      const ss = Math.floor((diff%60000)/1000);
      setCountdown({d:dd,h:hh,m:mm,s:ss});
    };
    tick();
    const iv = setInterval(tick, 1000);
    return () => clearInterval(iv);
  }, []);

  const withinDay = countdown.d === 0;

  const statusStyle = {
    upcoming:{cls:'badge-indigo',label:'Upcoming'},
    completed:{cls:'badge-mint',label:'Completed'},
    today:{cls:'badge-red',label:'Today'},
  };

  const instructions = [
    "Students must carry their Admit Card and College ID to the examination hall.",
    "No electronic devices (mobile phones, smart watches) are allowed inside the hall.",
    "Students must be seated 15 minutes before the examination begins.",
    "Use only blue/black ballpoint pen for answering. Pencil is allowed for diagrams.",
    "Communication of any kind between students during examination is strictly prohibited.",
  ];

  return (
    <div className="page-enter" style={{overflowY:'auto',height:'100%',padding:'24px 28px'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:24}}>
        <div>
          <h2 className="font-syne" style={{fontSize:22,fontWeight:800,color:'#fff',marginBottom:4}}>Exam Schedule</h2>
          <p style={{fontSize:13,color:'#64748B'}}>End Semester Examination — May–June 2025</p>
        </div>
        <button className="btn-primary" style={{display:'flex',alignItems:'center',gap:8}}>
          📥 Download Admit Card
        </button>
      </div>

      {/* Countdown */}
      {nextExam && (
        <div className="glass-card" style={{padding:'20px 24px',marginBottom:24,background:'linear-gradient(135deg,rgba(99,102,241,.12),rgba(139,92,246,.08))'}}>
          <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:14}}>
            {withinDay && <div style={{width:10,height:10,borderRadius:'50%',background:'#EF4444'}} className="pulse-red"/>}
            <h3 className="font-syne" style={{fontSize:13,fontWeight:700,color:'#94A3B8',textTransform:'uppercase',letterSpacing:'.8px'}}>
              Next Exam: <span style={{color:'#E43F3F'}}>{nextExam.subject}</span>
            </h3>
          </div>
          <div style={{display:'flex',gap:12}}>
            {[{val:countdown.d,lbl:'Days'},{val:countdown.h,lbl:'Hours'},{val:countdown.m,lbl:'Mins'},{val:countdown.s,lbl:'Secs'}].map((seg,i) => (
              <div key={i} className="cd-seg">
                <div className="cd-num" style={{color:withinDay?'#EF4444':'#E43F3F'}}>{String(seg.val).padStart(2,'0')}</div>
                <div className="cd-lbl">{seg.lbl}</div>
              </div>
            ))}
            <div style={{flex:1,padding:'12px 16px',background:'rgba(26,29,40,.5)',borderRadius:10,border:'1px solid rgba(99,102,241,.12)',display:'flex',flexDirection:'column',justifyContent:'center'}}>
              <div style={{fontSize:11,color:'#64748B',marginBottom:3}}>Date & Time</div>
              <div style={{fontSize:13,fontWeight:600,color:'#E2E8F0'}}>{nextExam.date} • {nextExam.time}</div>
              <div style={{fontSize:11,color:'#94A3B8',marginTop:3}}>Room: {nextExam.room} • Duration: {nextExam.duration}</div>
            </div>
          </div>
        </div>
      )}

      {/* Timetable */}
      <div className="glass-card" style={{overflow:'hidden',marginBottom:24}}>
        <div style={{padding:'14px 20px',borderBottom:'1px solid rgba(99,102,241,.12)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <h3 className="font-syne" style={{fontSize:13,fontWeight:700,color:'#94A3B8',textTransform:'uppercase',letterSpacing:'.8px'}}>Examination Timetable</h3>
          <span className="badge badge-indigo">{upcoming.length} Upcoming</span>
        </div>
        <table className="data-table">
          <thead><tr><th>Date</th><th>Day</th><th>Subject</th><th>Time</th><th>Room</th><th>Duration</th><th>Status</th></tr></thead>
          <tbody>
            {d.exams.map((ex,i) => {
              const st = statusStyle[ex.status];
              return (
                <tr key={i} style={{opacity:ex.status==='completed'?0.55:1}}>
                  <td style={{fontWeight:600,color:'#E43F3F',fontFamily:'Syne,sans-serif',fontSize:12}}>{ex.date}</td>
                  <td style={{color:'#64748B',fontSize:12}}>{ex.day}</td>
                  <td style={{fontWeight:600,color:'#E2E8F0'}}>{ex.subject}</td>
                  <td style={{color:'#94A3B8'}}>{ex.time}</td>
                  <td><span style={{fontFamily:'monospace',color:'#64748B',fontSize:12}}>{ex.room}</span></td>
                  <td style={{color:'#64748B'}}>{ex.duration}</td>
                  <td><span className={`badge ${st.cls}`}>{st.label}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Instructions accordion */}
      <div className="glass-card" style={{overflow:'hidden'}}>
        <div style={{padding:'14px 20px',borderBottom:'1px solid rgba(99,102,241,.12)'}}>
          <h3 className="font-syne" style={{fontSize:13,fontWeight:700,color:'#94A3B8',textTransform:'uppercase',letterSpacing:'.8px'}}>Important Instructions</h3>
        </div>
        {instructions.map((rule,i) => (
          <div key={i} style={{borderBottom: i<instructions.length-1 ? '1px solid rgba(99,102,241,.07)' : 'none'}}>
            <div
              onClick={()=>setOpenAccordion(openAccordion===i?null:i)}
              style={{display:'flex',alignItems:'center',gap:12,padding:'14px 20px',cursor:'pointer',transition:'background .15s'}}
              className="sidebar-item"
            >
              <div style={{width:24,height:24,borderRadius:'50%',background:'rgba(99,102,241,.15)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:700,color:'#E43F3F',flexShrink:0}}>{i+1}</div>
              <span style={{fontSize:13,color:'#CBD5E1',flex:1}}>{rule.length>60?rule.slice(0,60)+'…':rule}</span>
              <span style={{color:'#64748B',fontSize:14,transform:openAccordion===i?'rotate(90deg)':'none',transition:'transform .2s'}}>›</span>
            </div>
            {openAccordion===i && (
              <div style={{padding:'0 20px 14px 56px',fontSize:13,color:'#94A3B8',lineHeight:1.7}}>{rule}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};



// ─── ORCHESTRA — MAIN APP ─────────────────────────────────────────────────────


// Lucide icons via global
const Icons = LucideIcons || {};

function Icon({ name, size=18, color, style:s }) {
  const C = Icons[name] || Icons['Circle'];
  return React.createElement(C, { size, color, style:s });
}

// ─── SIDEBAR ─────────────────────────────────────────────────────────────────
// Navigation items are now defined dynamically within the OrchestraApp component.

function Sidebar({ active, setActive, collapsed, setCollapsed, userData, userRole, navItems }) {
  const accentColor = userRole === 'student' ? '#6366F1' : userRole === 'teacher' ? '#34D399' : '#F59E0B';
  const avatar = userData.avatar || userData.name.split(' ').map(n=>n[0]).join('');

  return (
    <div style={{
      width: collapsed ? 58 : 240,
      background:'#0D0F14',
      borderRight:'1px solid rgba(99,102,241,.12)',
      display:'flex',
      flexDirection:'column',
      transition:'width .3s cubic-bezier(.4,0,.2,1)',
      overflow:'hidden',
      flexShrink:0,
      height:'100%',
    }}>
      {/* Branding */}
      <div style={{padding: collapsed?'20px 0':'20px 20px',display:'flex',alignItems:'center',gap:12,borderBottom:'1px solid rgba(255,255,255,0.05)',justifyContent:collapsed?'center':'flex-start',height:64,flexShrink:0}}>
        <div style={{width:34,height:34,borderRadius:10,background:`linear-gradient(135deg, ${accentColor}, #8B5CF6)`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,boxShadow:`0 0 16px ${accentColor}44`, color: 'white', fontWeight: 900, fontSize: 18}}>O</div>
        {!collapsed && (
          <div>
            <div className="font-syne" style={{fontSize:16,fontWeight:800,background:`linear-gradient(135deg,${accentColor},#E8A87C)`,WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',letterSpacing:'.5px'}}>Orchestra</div>
            <div style={{fontSize:10,color:'#475569',letterSpacing:.5}}>{userRole.toUpperCase()} PORTAL</div>
          </div>
        )}
      </div>

      {/* Nav items */}
      <div style={{flex:1,padding:'12px 8px',overflowY:'auto',overflowX:'hidden'}}>
        {navItems.map(item => (
          <div
            key={item.id}
            className={`sidebar-item tooltip ${active===item.id?'active':''}`}
            onClick={()=>setActive(item.id)}
            style={{
              justifyContent:collapsed?'center':'flex-start',
              marginBottom:3,
              borderLeft: active===item.id ? `3px solid ${accentColor}` : undefined
            }}
          >
            <Icon name={item.icon} size={18} color={active===item.id?accentColor:undefined}/>
            {!collapsed && <span style={{fontSize:13,fontWeight:active===item.id?600:400}}>{item.label}</span>}
            {collapsed && <span className="tooltip-label">{item.label}</span>}
          </div>
        ))}
      </div>

      {/* Collapse toggle */}
      <div style={{padding:'12px 8px',borderTop:'1px solid rgba(99,102,241,.1)'}}>
        <div
          className="sidebar-item"
          onClick={()=>setCollapsed(p=>!p)}
          style={{justifyContent:collapsed?'center':'flex-start'}}
        >
          <span style={{fontSize:16,transition:'transform .3s',transform:collapsed?'rotate(180deg)':'none',display:'inline-block'}}>‹</span>
          {!collapsed && <span style={{fontSize:12,color:'#64748B'}}>Collapse Sidebar</span>}
        </div>
        {!collapsed && (
          <div style={{padding:'10px 8px',display:'flex',alignItems:'center',gap:10}}>
            <div style={{width:32,height:32,borderRadius:'50%',background:`linear-gradient(135deg,${accentColor},#8B5CF6)`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:700,color:'#fff',fontFamily:'Syne,sans-serif',flexShrink:0, overflow: 'hidden'}}>
              {userData.photo ? <img src={userData.photo} style={{width:'100%',height:'100%',objectFit:'cover'}}/> : avatar}
            </div>
            <div style={{overflow:'hidden'}}>
              <div style={{fontSize:12,fontWeight:600,color:'#E2E8F0',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{userData.name}</div>
              <div style={{fontSize:10,color:'#475569'}}>{userData.id}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── HEADER ──────────────────────────────────────────────────────────────────
function Header({ active, setActive, userData, userRole, onLogout, navItems }) {
  const d = window.OrchestraData;
  const [notifOpen, setNotifOpen] = React.useState(false);
  const [userOpen, setUserOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const unread = d.notifications.filter(n=>!n.read).length;

  const accentColor = userRole === 'student' ? '#6366F1' : userRole === 'teacher' ? '#34D399' : '#F59E0B';
  const avatar = userData.avatar || userData.name.split(' ').map(n=>n[0]).join('');

  return (
    <div className="header-jiet" style={{height:64,display:'flex',alignItems:'center',gap:20,padding:'0 24px',flexShrink:0,position:'relative',zIndex:50, background: 'rgba(13,15,20,0.8)', borderBottom: '1px solid rgba(255,255,255,0.08)'}}>
      {/* Logo & Title */}
      <div style={{display:'flex',alignItems:'center',gap:12}}>
        <div style={{width:32,height:32,borderRadius:8,background:`linear-gradient(135deg, ${accentColor}, #8B5CF6)`,display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontWeight:900,fontSize:18,boxShadow:`0 0 16px ${accentColor}44`}}>O</div>
        <h2 className="font-syne" style={{fontSize:18,fontWeight:800,color:'white',letterSpacing:1}}>ORCHESTRA</h2>
      </div>

      {/* Search */}
      <div style={{position:'relative',width:210,marginLeft:40}}>
        <input
          placeholder="Search Digiicampus"
          value={search}
          onChange={e=>setSearch(e.target.value)}
          style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '10px 36px 10px 16px', borderRadius: 20, color: 'white', outline: 'none', fontSize: 13, fontFamily: 'DM Sans, sans-serif' }}
        />
        <span style={{position:'absolute',right:14,top:'50%',transform:'translateY(-50%)',color:'#94A3B8',fontSize:15}}>🔍</span>
      </div>

      {/* Right Icons */}
      <div style={{marginLeft:'auto',display:'flex',alignItems:'center',gap:20}}>
        <button style={{background:'transparent',border:'none',color:'white',cursor:'pointer',position:'relative'}}>
          <Icon name="Bell" size={20} color="white"/>
          {unread>0 && <div style={{position:'absolute',top:-2,right:-2,width:14,height:14,borderRadius:'50%',background:'#facc15',border:'2px solid #6366F1',color: '#6366F1', fontSize: 8, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{unread}</div>}
        </button>

        <div style={{position:'relative'}}>
          <button
            onClick={()=>{setUserOpen(p=>!p);}}
            style={{display:'flex',alignItems:'center',gap:10,background:'transparent',border:'none',cursor:'pointer'}}
          >
            <div style={{width:32,height:32,borderRadius:'50%',background:'white',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:900,color:'#6366F1', overflow: 'hidden'}}>
              {userData.photo ? <img src={userData.photo} style={{width:'100%',height:'100%',objectFit:'cover'}}/> : avatar}
            </div>
            <Icon name="ChevronDown" size={14} color="white"/>
          </button>
          {userOpen && (
            <div className="dropdown" style={{right:0, top: 40, width: 220}}>
              <div style={{padding:'12px 16px',borderBottom:'1px solid rgba(0,0,0,.05)'}}>
                <div style={{fontSize:13,fontWeight:700,color:'#1a1c23'}}>{userData.name}</div>
                <div style={{fontSize:11,color:'#64748b'}}>{userData.designation || userData.branch}</div>
              </div>
              {[
                {label:'👤 View Profile',action:()=>{setActive('profile');setUserOpen(false);}},
                {label:'⚙️ Settings',action:()=>setUserOpen(false)},
                {label:'🚪 Logout',action:()=>onLogout()},
              ].map(item=>(
                <div key={item.label} className="dropdown-item" onClick={item.action}>{item.label}</div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── MODULE ROUTER ────────────────────────────────────────────────────────────
function ModuleView({ active, userRole }) {
  const map = {
    dashboard: window.DashboardModule,
    profile: window.ProfileModule,
    courses: window.CoursesModule,
    admissions: window.AdmissionsModule,
    fees: window.FeesModule,
    attendance: window.AttendanceModule,
    student_attendance: window.StudentAttendanceModule,
    faculty: window.FacultyModule,
    exams: window.ExamsModule,
    classroom: window.ClassroomModule,
    feedback: window.FeedbackModule,
    online_exam: window.OnlineExamModule,
    calendar: window.CalendarModule,
    placements: window.PlacementModule,
    drive: window.DriveModule,
    message: window.MessageModule,
    help_center: window.HelpCenterModule,
    hostel: window.HostelModule,
    gate_pass: window.GatePassModule,
    payments: window.FeesModule,
    students: window.StudentManagementModule,
    grades: window.GradeBookModule,
    users: window.UserControlModule,
    institutional: window.CampusConfigModule,
    financials: window.FinancialsModule,
    reports: window.SystemReportsModule,
  };
  const Comp = map[active];
  if (!Comp) return <div style={{padding:40,color:'#64748B'}}>Module not found: {active}</div>;
  return React.createElement(Comp, { key: active, userRole });
}

// ─── NOTIFICATION UTILITY ──────────────────────────────────────────────────
const notify = (msg) => {
  const n = document.createElement('div');
  n.style.cssText = 'position:fixed;bottom:24px;right:24px;background:#1a1c23;color:white;padding:12px 24px;border-radius:8px;box-shadow:0 8px 32px rgba(0,0,0,0.2);z-index:9999;font-size:14px;border-left:4px solid #6366F1;animation:fadeSlideIn 0.3s ease;';
  n.innerText = msg;
  document.body.appendChild(n);
  setTimeout(() => { n.style.opacity = '0'; setTimeout(() => n.remove(), 300); }, 3000);
};

// ─── MODULE IMPLEMENTATIONS ────────────────────────────────────────────────

window.ClassroomModule = () => (
  <div className="page-enter" style={{ padding: 24 }}>
    <h2 className="font-syne" style={{ fontSize: 20, fontWeight: 800, marginBottom: 20 }}>My Classrooms</h2>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
      {['Data Structures', 'Machine Learning', 'Compiler Design', 'Social Networks'].map(sub => (
        <div key={sub} className="glass-card" style={{ padding: 20 }}>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{sub}</div>
          <div style={{ fontSize: 12, color: '#64748b', marginBottom: 12 }}>Dr. Priya Sharma • CSE-402</div>
          <button className="btn-outline" onClick={() => notify(`Opening ${sub} classroom...`)} style={{ width: '100%' }}>Enter Class</button>
        </div>
      ))}
    </div>
  </div>
);

window.FeesModule = () => (
  <div className="page-enter" style={{ padding: 24 }}>
    <h2 className="font-syne" style={{ fontSize: 20, fontWeight: 800, marginBottom: 20 }}>Fee Management</h2>
    <div className="glass-card" style={{ padding: 24, marginBottom: 20, background: 'linear-gradient(135deg, #6366F105, #6366F115)' }}>
      <div style={{ fontSize: 14, color: '#64748b' }}>Outstanding Balance</div>
      <div style={{ fontSize: 32, fontWeight: 900, color: '#6366F1', margin: '8px 0' }}>₹24,500.00</div>
      <button className="btn-primary" onClick={() => notify('Redirecting to payment gateway...')}>Pay Now</button>
    </div>
    <div className="glass-card" style={{ padding: 20 }}>
      <h4 style={{ marginBottom: 16 }}>Payment History</h4>
      {[1, 2].map(i => (
        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>Sem IV Tuition Fee</div>
            <div style={{ fontSize: 11, color: '#94A3B8' }}>TRX-9920334 • 12 Jan 2025</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 13, fontWeight: 700 }}>₹82,000</div>
            <div style={{ fontSize: 10, color: '#34D399', fontWeight: 700 }}>PAID</div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

window.PlacementModule = () => (
  <div className="page-enter" style={{ padding: 24 }}>
    <h2 className="font-syne" style={{ fontSize: 20, fontWeight: 800, marginBottom: 20 }}>Placements Portal</h2>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {[{c:'Google', r:'SDE Intern', s:'₹1.2L/mo'}, {c:'Microsoft', r:'Analyst', s:'₹18 LPA'}].map(j => (
        <div key={j.c} className="glass-card" style={{ padding: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700 }}>{j.c}</div>
            <div style={{ fontSize: 13, color: '#64748b' }}>{j.r} • {j.s}</div>
          </div>
          <button className="btn-outline" onClick={() => notify(`Applied to ${j.c}`)}>Apply Now</button>
        </div>
      ))}
    </div>
  </div>
);

window.GatePassModule = () => (
  <div className="page-enter" style={{ padding: 24 }}>
    <h2 className="font-syne" style={{ fontSize: 20, fontWeight: 800, marginBottom: 20 }}>Gate Pass Request</h2>
    <div className="glass-card" style={{ padding: 24, maxWidth: 450 }}>
      <div style={{ marginBottom: 16 }}>
        <label style={{ fontSize: 11, fontWeight: 700, display: 'block', marginBottom: 8 }}>PURPOSE OF VISIT</label>
        <select className="input-field" style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #e2e8f0' }}><option>Going Home</option><option>Medical</option><option>Market</option></select>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
        <div>
          <label style={{ fontSize: 11, fontWeight: 700, display: 'block', marginBottom: 8 }}>OUT TIME</label>
          <input type="time" className="input-field" style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #e2e8f0' }} />
        </div>
        <div>
          <label style={{ fontSize: 11, fontWeight: 700, display: 'block', marginBottom: 8 }}>IN TIME</label>
          <input type="time" className="input-field" style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #e2e8f0' }} />
        </div>
      </div>
      <button className="btn-primary" style={{ width: '100%' }} onClick={() => notify('Pass request sent to Warden')}>Generate Pass</button>
    </div>
  </div>
);

window.HostelModule = () => (
  <div className="page-enter" style={{ padding: 24 }}>
    <h2 className="font-syne" style={{ fontSize: 20, fontWeight: 800, marginBottom: 20 }}>Hostel Services</h2>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
      <div className="glass-card" style={{ padding: 20 }}>
        <h4 style={{ marginBottom: 12 }}>Room Details</h4>
        <div style={{ fontSize: 13, marginBottom: 4 }}>Block A • Room 302</div>
        <div style={{ fontSize: 11, color: '#64748b' }}>Shared (2 Seater)</div>
        <button className="btn-outline" style={{ marginTop: 12, fontSize: 11 }} onClick={() => notify('Maintenance ticket raised')}>Report Issue</button>
      </div>
      <div className="glass-card" style={{ padding: 20 }}>
        <h4 style={{ marginBottom: 12 }}>Mess Coupon</h4>
        <div style={{ background: 'rgba(255,255,255,0.02)', padding: 12, borderRadius: 8, textAlign: 'center', border: '1px dashed #cbd5e1' }}>
          <div style={{ fontSize: 10, color: '#64748b' }}>TONIGHT'S DINNER</div>
          <div style={{ fontSize: 14, fontWeight: 700, margin: '4px 0' }}>JID-88291</div>
        </div>
      </div>
    </div>
  </div>
);

window.FeedbackModule = () => (
  <div className="page-enter" style={{ padding: 24 }}>
    <h2 className="font-syne" style={{ fontSize: 20, fontWeight: 800, marginBottom: 20 }}>Course Feedback</h2>
    <div className="glass-card" style={{ padding: 24 }}>
      <p style={{ fontSize: 13, color: '#64748b', marginBottom: 16 }}>Your feedback helps us improve teaching quality.</p>
      {['Teacher Punctuality', 'Course Content', 'Clarity of Explanation'].map(q => (
        <div key={q} style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>{q}</div>
          <div style={{ display: 'flex', gap: 8 }}>
            {[1, 2, 3, 4, 5].map(n => (
              <button key={n} onClick={() => notify('Rating selected')} style={{ width: 32, height: 32, borderRadius: 4, border: '1px solid #cbd5e1', background: 'white', cursor: 'pointer' }}>{n}</button>
            ))}
          </div>
        </div>
      ))}
      <button className="btn-primary" onClick={() => notify('Feedback submitted. Thank you!')}>Submit Feedback</button>
    </div>
  </div>
);

window.OnlineExamModule = () => (
  <div className="page-enter" style={{ padding: 24 }}>
    <h2 className="font-syne" style={{ fontSize: 20, fontWeight: 800, marginBottom: 20 }}>Online Examination</h2>
    <div className="glass-card" style={{ padding: 40, textAlign: 'center' }}>
      <div style={{ fontSize: 48, marginBottom: 20 }}>⏳</div>
      <h3 style={{ marginBottom: 10 }}>No Active Exams</h3>
      <p style={{ fontSize: 14, color: '#64748b' }}>Check your schedule for upcoming mid-term tests.</p>
    </div>
  </div>
);

window.CalendarModule = () => (
  <div className="page-enter" style={{ padding: 24 }}>
    <h2 className="font-syne" style={{ fontSize: 20, fontWeight: 800, marginBottom: 20 }}>Academic Calendar</h2>
    <div className="glass-card" style={{ padding: 20 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 10 }}>
        {Array.from({length: 31}, (_, i) => (
          <div key={i} style={{ height: 60, background: 'rgba(255,255,255,0.02)', borderRadius: 4, padding: 6, fontSize: 11, border: '1px solid #f1f5f9' }}>
            {i+1}
            {i === 14 && <div style={{ color: '#6366F1', fontWeight: 900, marginTop: 4 }}>HOLIDAY<br/><span style={{fontSize:9, fontWeight: 500, color:'#94A3B8'}}>Summer Break</span></div>}
          </div>
        ))}
      </div>
    </div>
  </div>
);

window.MessageModule = () => (
  <div className="page-enter" style={{ padding: 24 }}>
    <h2 className="font-syne" style={{ fontSize: 20, fontWeight: 800, marginBottom: 20 }}>Messages</h2>
    <div className="glass-card" style={{ display: 'flex', height: 400 }}>
      <div style={{ width: 200, borderRight: '1px solid #f1f5f9', padding: 10 }}>
        <div style={{ padding: 10, background: 'rgba(255,255,255,0.02)', borderRadius: 6, fontSize: 12, fontWeight: 600 }}>Dean's Office</div>
      </div>
      <div style={{ flex: 1, padding: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8' }}>
        Select a conversation to read
      </div>
    </div>
  </div>
);

window.HelpCenterModule = () => (
  <div className="page-enter" style={{ padding: 24 }}>
    <h2 className="font-syne" style={{ fontSize: 20, fontWeight: 800, marginBottom: 20 }}>Campus Help Center</h2>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
      <div className="glass-card" style={{ padding: 20 }}>
        <h4>IT Support</h4>
        <p style={{ fontSize: 12, color: '#64748b', margin: '8px 0' }}>For WiFi, Portal or Email issues.</p>
        <button className="btn-outline" onClick={() => notify('Ticket raised for IT Support')}>Open Ticket</button>
      </div>
      <div className="glass-card" style={{ padding: 20 }}>
        <h4>Academic Cell</h4>
        <p style={{ fontSize: 12, color: '#64748b', margin: '8px 0' }}>For results, transcripts or registration.</p>
        <button className="btn-outline" onClick={() => notify('Academic support notified')}>Request Help</button>
      </div>
    </div>
  </div>
);

window.DriveModule = () => (
  <div className="page-enter" style={{ padding: 24 }}>
    <h2 className="font-syne" style={{ fontSize: 20, fontWeight: 800, marginBottom: 20 }}>Student Drive</h2>
    <div className="glass-card" style={{ padding: 20 }}>
      {['Notes_Sem4.pdf', 'Project_Report_v2.docx', 'Syllabus.pdf'].map(f => (
        <div key={f} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}>
          <div style={{ fontSize: 13 }}>📄 {f}</div>
          <button style={{ color: '#6366F1', border: 'none', background: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700 }} onClick={() => notify('Downloading file...')}>Download</button>
        </div>
      ))}
    </div>
  </div>
);

// ─── ATTENDANCE MODULE (TEACHER) ───────────────────────────────────────────
window.AttendanceModule = function AttendanceModule({ userRole }) {
  const d = window.OrchestraData;
  const [branch, setBranch] = useState('CSE (AIML)');
  const [marked, setMarked] = useState({});

  if (userRole === 'student') {
    return (
      <div className="page-enter" style={{ padding: 24 }}>
        <h2 className="font-syne" style={{ fontSize: 20, fontWeight: 800, marginBottom: 20 }}>My Attendance</h2>
        <div className="glass-card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', gap: 40 }}>
            <div>
              <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>Total Percentage</div>
              <div style={{ fontSize: 32, fontWeight: 800, color: '#6366F1' }}>84.2%</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>Present / Total</div>
              <div style={{ fontSize: 32, fontWeight: 800 }}>142 / 168</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const filtered = (d.students || []).filter(s => s.branch === branch);
  const toggle = (id) => setMarked(prev => ({...prev, [id]: !prev[id]}));

  return (
    <div className="page-enter" style={{ padding: 24, background: 'transparent', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 className="font-syne" style={{ fontSize: 20, fontWeight: 800 }}>Attendance Marking</h2>
        <div style={{ display: 'flex', gap: 10 }}>
          <select className="input-field" value={branch} onChange={e=>setBranch(e.target.value)} style={{ width: 200 }}>
            <option>CSE (AIML)</option>
            <option>Civil</option>
            <option>Mechanical</option>
          </select>
          <button className="btn-primary" style={{ background: '#6366F1' }}>Save Attendance</button>
        </div>
      </div>

      <div className="glass-card" style={{ overflow: 'hidden' }}>
        <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ padding: '12px 16px', textAlign: 'left', width: 80 }}>Status</th>
              <th style={{ padding: '12px 16px', textAlign: 'left' }}>Roll Number</th>
              <th style={{ padding: '12px 16px', textAlign: 'left' }}>Student Name</th>
              <th style={{ padding: '12px 16px', textAlign: 'left' }}>Section</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(s => (
              <tr key={s.id} onClick={() => toggle(s.id)} style={{ borderBottom: '1px solid #f1f5f9', cursor: 'pointer' }}>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ 
                    width: 20, height: 20, border: '2px solid #cbd5e1', borderRadius: 4,
                    background: marked[s.id] ? '#34D399' : 'transparent',
                    borderColor: marked[s.id] ? '#34D399' : '#cbd5e1',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 12
                  }}>
                    {marked[s.id] && '✓'}
                  </div>
                </td>
                <td style={{ padding: '12px 16px', fontWeight: 600 }}>{s.id}</td>
                <td style={{ padding: '12px 16px' }}>{s.name}</td>
                <td style={{ padding: '12px 16px' }}>Sec {s.section}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ─── LOGIN MODULE ─────────────────────────────────────────────────────────────
window.LoginModule = function LoginModule({ onLogin }) {
  const [role, setRole] = React.useState('student');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const themes = {
    student: {
      color: '#6366F1',
      icon: 'GraduationCap',
      label: 'Student Portal',
      desc: 'Access your courses, attendance, and campus life.'
    },
    teacher: {
      color: '#34D399',
      icon: 'BookOpen',
      label: 'Faculty Portal',
      desc: 'Manage classrooms, grading, and student progress.'
    },
    admin: {
      color: '#F59E0B',
      icon: 'ShieldCheck',
      label: 'Admin Console',
      desc: 'Institutional oversight and system configuration.'
    }
  };

  const current = themes[role];

  const handleLogin = () => {
    setLoading(true);
    setTimeout(() => {
      onLogin(role);
      setLoading(false);
    }, 800);
  };

  return (
    <div className="page-enter" style={{
      height: '100vh',
      width: '100vw',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#0D0F14',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Dynamic Background */}
      <div style={{
        position: 'absolute',
        top: '15%',
        left: '15%',
        width: '500px',
        height: '500px',
        background: `${current.color}15`,
        filter: 'blur(120px)',
        borderRadius: '50%',
        transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '10%',
        right: '10%',
        width: '400px',
        height: '400px',
        background: '#8B5CF612',
        filter: 'blur(100px)',
        borderRadius: '50%'
      }} />

      <div className="glass-card" style={{
        width: '440px',
        padding: '48px',
        border: `1px solid ${current.color}25`,
        boxShadow: `0 24px 60px rgba(0,0,0,0.4), 0 0 20px ${current.color}10`,
        position: 'relative',
        zIndex: 10
      }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{
            width: '72px',
            height: '72px',
            borderRadius: '20px',
            background: `linear-gradient(135deg, ${current.color}, ${current.color}aa)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            boxShadow: `0 12px 32px ${current.color}44`,
            transition: 'all 0.4s ease'
          }}>
            <Icon name={current.icon} size={32} color="#fff" />
          </div>
          <h1 className="font-syne" style={{ fontSize: '28px', color: '#fff', marginBottom: '8px', letterSpacing: '-0.5px' }}>
            {current.label}
          </h1>
          <p style={{ fontSize: '14px', color: '#64748B', lineHeight: 1.5 }}>{current.desc}</p>
        </div>

        {/* Role Switcher */}
        <div style={{ 
          display: 'flex', 
          gap: '6px', 
          marginBottom: '32px', 
          background: 'rgba(26,29,40,0.8)', 
          padding: '6px', 
          borderRadius: '12px',
          border: '1px solid rgba(99,102,241,0.08)'
        }}>
          {['student', 'teacher', 'admin'].map(r => (
            <button
              key={r}
              onClick={() => setRole(r)}
              style={{
                flex: 1,
                padding: '10px',
                fontSize: '12px',
                fontWeight: 700,
                borderRadius: '8px',
                border: 'none',
                background: role === r ? `linear-gradient(135deg, ${current.color}22, ${current.color}11)` : 'transparent',
                color: role === r ? current.color : '#475569',
                cursor: 'pointer',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                transition: 'all 0.3s'
              }}
            >
              {r}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ fontSize: '11px', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '8px', display: 'block' }}>Email Identity</label>
            <input
              className="input-field"
              type="email"
              placeholder={`your.${role}@institution.edu`}
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={{ padding: '14px' }}
            />
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <label style={{ fontSize: '11px', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px' }}>Password</label>
              <span style={{ fontSize: '11px', color: current.color, cursor: 'pointer', fontWeight: 600 }}>Forgot?</span>
            </div>
            <input
              className="input-field"
              type="password"
              placeholder="••••••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={{ padding: '14px' }}
            />
          </div>
          
          <button
            className="btn-primary"
            style={{
              marginTop: '12px',
              padding: '15px',
              fontSize: '15px',
              background: `linear-gradient(135deg, ${current.color}, ${current.color}cc)`,
              boxShadow: `0 10px 25px ${current.color}33`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px'
            }}
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <div className="loader-ring" style={{ width: 18, height: 18, borderTopColor: '#fff' }} />
            ) : (
              <>Sign In to Orchestra <Icon name="ArrowRight" size={18} /></>
            )}
          </button>
        </div>

        <div style={{ textAlign: 'center', marginTop: '32px', borderTop: '1px solid rgba(99,102,241,0.08)', paddingTop: '24px' }}>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            New to the campus? <span style={{ color: current.color, cursor: 'pointer', fontWeight: 600 }}>Create an account</span>
          </p>
        </div>
      </div>
    </div>
  );
};

// ─── ROOT APP ─────────────────────────────────────────────────────────────────
function OrchestraApp() {
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const [userRole, setUserRole] = React.useState(null); // 'student', 'teacher', 'admin'
  const [active, setActive] = React.useState('dashboard');
  const [collapsed, setCollapsed] = React.useState(false);

  const navItems = React.useMemo(() => {
    const base = [{ id:'dashboard', icon:'LayoutDashboard', label:'Dashboard' }];
    if (userRole === 'student') return [
      { id:'dashboard', icon:'Home', label:'Home' },
      { id:'profile', icon:'User', label:'Profile' },
      { id:'student_attendance', icon:'CheckCircle', label:'Attendance' },
      { id:'classroom', icon:'Book', label:'Classroom' },
      { id:'courses', icon:'BookOpen', label:'Course Registration' },
      { id:'feedback', icon:'MessageSquare', label:'Feedback' },
      { id:'exams', icon:'ClipboardList', label:'Examinations' },
      { id:'online_exam', icon:'Monitor', label:'Online Exam' },
      { id:'calendar', icon:'Calendar', label:'Calendar' },
      { id:'placements', icon:'Briefcase', label:'Placements' },
      { id:'drive', icon:'HardDrive', label:'Drive' },
      { id:'message', icon:'Mail', label:'Message' },
      { id:'help_center', icon:'HelpCircle', label:'Campus Help Center' },
      { id:'hostel', icon:'Home', label:'Hostel' },
      { id:'gate_pass', icon:'Lock', label:'Gate Pass' },
      { id:'payments', icon:'CreditCard', label:'Payments' },
    ];
    if (userRole === 'teacher') return [
      { id:'dashboard', icon:'Home', label:'Home' },
      { id:'profile', icon:'User', label:'My Profile' },
      { id:'attendance', icon:'CalendarCheck', label:'Mark Attendance' },
      { id:'students', icon:'Users', label:'Student Management' },
      { id:'grades', icon:'ClipboardList', label:'Gradebook' },
      { id:'classroom', icon:'Book', label:'Classrooms' },
      { id:'faculty', icon:'Users2', label:'Faculty Directory' },
      { id:'message', icon:'Mail', label:'Message' },
    ];
    return [ // admin
      { id:'dashboard', icon:'Home', label:'Home' },
      { id:'admissions', icon:'FileText', label:'Admissions' },
      { id:'users', icon:'Users', label:'User Control' },
      { id:'institutional', icon:'Building2', label:'Campus Config' },
      { id:'financials', icon:'CreditCard', label:'Financials' },
      { id:'reports', icon:'BarChart3', label:'System Reports' },
    ];
  }, [userRole]);

  if (!isLoggedIn) {
    return <window.LoginModule onLogin={(role) => {
      setUserRole(role);
      setIsLoggedIn(true);
    }} />;
  }

  const userData = userRole === 'student' ? window.OrchestraData.student : 
                 userRole === 'teacher' ? window.OrchestraData.faculty : 
                 window.OrchestraData.admin;

  return (
    <div style={{display:'flex',flexDirection:'column',height:'100vh',overflow:'hidden',background:'#0D0F14'}}>
      <Header active={active} setActive={setActive} userData={userData} userRole={userRole} onLogout={() => setIsLoggedIn(false)} navItems={navItems} />
      <div style={{display:'flex',flex:1,overflow:'hidden'}}>
        <Sidebar active={active} setActive={setActive} collapsed={collapsed} setCollapsed={setCollapsed} userData={userData} userRole={userRole} navItems={navItems} />
        <div style={{flex:1,overflow:'hidden',display:'flex',flexDirection:'column'}}>
          <ModuleView active={active} userRole={userRole} />
        </div>
      </div>
    </div>
  );
}

export default OrchestraApp;
