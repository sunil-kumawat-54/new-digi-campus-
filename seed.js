import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load .env file
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase URL or Anon Key in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const mockStudents = [
    { id: "24EJIAI142", name: "Sunil Kumar", branch: "CSE (AIML)", sem: 4 },
    { id: "24EJIAI143", name: "Rahul Sharma", branch: "CSE (AIML)", sem: 4 },
    { id: "24EJIAI144", name: "Ananya Gupta", branch: "CSE (AIML)", sem: 4 },
    { id: "24EJIAI145", name: "Isha Malhotra", branch: "CSE (AIML)", sem: 4 },
    { id: "24EJICV088", name: "Vikram Rathore", branch: "Civil", sem: 4 },
    { id: "24EJICV089", name: "Amitabh Jain", branch: "Civil", sem: 4 },
    { id: "24EJIMX012", name: "Meera Singh", branch: "Mechanical", sem: 4 },
    { id: "24EJIMX013", name: "Karan Johar", branch: "Mechanical", sem: 4 },
    { id: "24EJICS001", name: "Aditi Rao", branch: "CSE", sem: 6 },
    { id: "24EJICS002", name: "Rohan Varma", branch: "CSE", sem: 6 },
    { id: "24EJIE101", name: "Sanya Mirza", branch: "Electrical", sem: 2 },
    { id: "24EJIE102", name: "Virat Kohli", branch: "Electrical", sem: 2 },
];

const mockFaculty = [
    { id:1, name:"Dr. Priya Sharma", dept:"Computer Science" },
    { id:2, name:"Prof. Rajesh Verma", dept:"AI & ML" },
    { id:3, name:"Dr. Ananya Iyer", dept:"AI & ML" },
    { id:4, name:"Prof. Meera Patel", dept:"Computer Science" },
    { id:5, name:"Dr. Suresh Nair", dept:"Mathematics" },
    { id:6, name:"Prof. Anil Sharma", dept:"Computer Science" },
    { id:7, name:"Dr. Kavya Reddy", dept:"AI & ML" },
    { id:8, name:"Dr. Vikram Singh", dept:"Computer Science" },
    { id:9, name:"Prof. Sanjay Gupta", dept:"AI & ML" },
    { id:10, name:"Dr. Neha Tiwari", dept:"Computer Science" },
    { id:11, name:"Prof. Sunita Das", dept:"Humanities" },
    { id:12, name:"Dr. Arjun Mehta", dept:"Computer Science" },
];

async function seedDatabase() {
    console.log('Starting database seeding...');

    // Seed Students
    const studentsToInsert = mockStudents.map(s => ({
        enrollment_number: s.id,
        name: s.name,
        department: s.branch,
        semester: s.sem
    }));

    const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .upsert(studentsToInsert, { onConflict: 'enrollment_number' })
        .select();

    if (studentsError) {
        console.error('Error seeding students:', studentsError);
    } else {
        console.log(`✅ Successfully seeded ${studentsData.length} students!`);
    }

    // Seed Faculty
    const facultyToInsert = mockFaculty.map(f => ({
        employee_id: `FAC20240${f.id.toString().padStart(2, '0')}`,
        name: f.name,
        department: f.dept
    }));

    const { data: facultyData, error: facultyError } = await supabase
        .from('faculty')
        .upsert(facultyToInsert, { onConflict: 'employee_id' })
        .select();

    if (facultyError) {
        console.error('Error seeding faculty:', facultyError);
    } else {
        console.log(`✅ Successfully seeded ${facultyData.length} faculty members!`);
    }

    console.log('Database seeding complete!');
}

seedDatabase();
