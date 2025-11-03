const ActivityTemplate = require('../models/ActivityTemplate'); 

// NOTE: This array contains the data structure definitions for 20 activity templates.
const templateData = [
    // --- TECHNICAL CATEGORY (7) ---
    {
        templateName: "National_Hackathon",
        templateCategory: "Technical",
        fields: [
            { fieldId: "event_name", label: "Hackathon Name", type: "text", required: true, placeholder: "e.g., CodeXpress 2024" },
            { fieldId: "organized_by", label: "Organizing Body/Company", type: "text", required: true },
            { fieldId: "date_start", label: "Start Date", type: "date", required: true },
            { fieldId: "date_end", label: "End Date", type: "date", required: true },
            { fieldId: "position_achieved", label: "Position/Ranking", type: "select", required: false, options: ["Winner (1st)", "Runner-Up (2nd)", "3rd Place", "Finalist", "Participant"] },
            { fieldId: "price_money", label: "Prize Money (INR)", type: "number", required: false, min: 0 },
            { fieldId: "project_summary", label: "Project Summary", type: "textarea", required: true, placeholder: "Briefly describe your solution and technologies used." },
            { fieldId: "proof_upload", label: "Certificate/Proof of Award", type: "file", required: true },
        ]
    },
    {
        templateName: "Technical_Workshop",
        templateCategory: "Technical",
        fields: [
            { fieldId: "topic", label: "Workshop Topic", type: "text", required: true, placeholder: "e.g., Advanced React Hooks" },
            { fieldId: "organized_by", label: "Conducted By", type: "text", required: true },
            { fieldId: "date_attended", label: "Date Attended", type: "date", required: true },
            { fieldId: "duration_hours", label: "Duration (Hours)", type: "number", required: true, min: 1, max: 80 },
            { fieldId: "proof_upload", label: "Certificate of Participation", type: "file", required: true },
        ]
    },
    {
        templateName: "International_Paper_Presentation",
        templateCategory: "Research",
        fields: [
            { fieldId: "paper_title", label: "Paper Title", type: "text", required: true },
            { fieldId: "conference_name", label: "Conference Name", type: "text", required: true },
            { fieldId: "date_presented", label: "Date Presented", type: "date", required: true },
            { fieldId: "level", label: "Level", type: "select", required: true, options: ["International", "National", "State"] },
            { fieldId: "journal_url", label: "Publication/DOI Link (if applicable)", type: "text", required: false },
            { fieldId: "proof_upload", label: "Acceptance Letter/Certificate", type: "file", required: true },
        ]
    },
    {
        templateName: "Online_Certification",
        templateCategory: "Technical",
        fields: [
            { fieldId: "course_name", label: "Course/Certification Name", type: "text", required: true, placeholder: "e.g., AWS Certified Developer" },
            { fieldId: "platform", label: "Platform/Body", type: "select", required: true, options: ["Coursera", "Udemy", "NPTEL", "HackerRank", "Official Vendor"] },
            { fieldId: "date_completed", label: "Date Completed", type: "date", required: true },
            { fieldId: "score", label: "Score/Grade (%)", type: "number", required: false, min: 0, max: 100 },
            { fieldId: "certificate_id", label: "Certificate ID/Number", type: "text", required: true },
            { fieldId: "proof_upload", label: "Certificate PDF/Image", type: "file", required: true },
        ]
    },
    {
        templateName: "Coding_Competition",
        templateCategory: "Technical",
        fields: [
            { fieldId: "contest_name", label: "Contest Name", type: "text", required: true, placeholder: "e.g., Google Code Jam Qualifier" },
            { fieldId: "platform", label: "Platform", type: "select", required: true, options: ["LeetCode", "HackerRank", "CodeChef", "Codeforces", "Others"] },
            { fieldId: "date_participated", label: "Date Participated", type: "date", required: true },
            { fieldId: "global_rank", label: "Global Rank", type: "number", required: false, min: 1 },
            { fieldId: "problems_solved", label: "Problems Solved", type: "number", required: true, min: 1 },
            { fieldId: "proof_upload", label: "Screenshot/Certificate of Rank", type: "file", required: true },
        ]
    },
    {
        templateName: "Guest_Lecture_Attendance",
        templateCategory: "Technical",
        fields: [
            { fieldId: "lecture_topic", label: "Lecture Topic", type: "text", required: true },
            { fieldId: "speaker_name", label: "Speaker Name and Designation", type: "text", required: true },
            { fieldId: "date_attended", label: "Date Attended", type: "date", required: true },
            { fieldId: "key_takeaways", label: "Key Takeaways (Min 50 words)", type: "textarea", required: true },
        ]
    },
    {
        templateName: "Faculty_Development_Program",
        templateCategory: "Technical",
        fields: [
            { fieldId: "fdp_name", label: "FDP Name/Topic", type: "text", required: true },
            { fieldId: "organized_by", label: "Organized By (Institution)", type: "text", required: true },
            { fieldId: "date_start", label: "Start Date", type: "date", required: true },
            { fieldId: "date_end", label: "End Date", type: "date", required: true },
            { fieldId: "proof_upload", label: "Certificate of Completion", type: "file", required: true },
        ]
    },
    // --- CULTURAL CATEGORY (5) ---
    {
        templateName: "Cultural_Festival_Participation",
        templateCategory: "Cultural",
        fields: [
            { fieldId: "event_name", label: "Cultural Event Name", type: "text", required: true, placeholder: "e.g., Annual College Fest 'Crescendo'" },
            { fieldId: "activity_type", label: "Activity Type", type: "select", required: true, options: ["Dance", "Music (Vocal/Inst)", "Drama", "Art/Sketching", "Literary"] },
            { fieldId: "date_participated", label: "Date Participated", type: "date", required: true },
            { fieldId: "position_achieved", label: "Position Achieved", type: "select", required: false, options: ["1st Place", "2nd Place", "3rd Place", "Participant"] },
            { fieldId: "proof_upload", label: "Photo/Certificate", type: "file", required: true, multiple: true },
        ]
    },
    {
        templateName: "Literary_Debate",
        templateCategory: "Cultural",
        fields: [
            { fieldId: "topic", label: "Debate Topic", type: "text", required: true },
            { fieldId: "organized_by", label: "Organized By", type: "text", required: true },
            { fieldId: "date_held", label: "Date Held", type: "date", required: true },
            { fieldId: "role", label: "Role", type: "select", required: true, options: ["Speaker", "Moderator", "Judge"] },
            { fieldId: "proof_upload", label: "Certificate/Photo", type: "file", required: true },
        ]
    },
    {
        templateName: "Organizing_Committee",
        templateCategory: "Cultural",
        fields: [
            { fieldId: "event_name", label: "Event Organized", type: "text", required: true },
            { fieldId: "role", label: "Role in Committee", type: "text", required: true, placeholder: "e.g., Head of Marketing, Volunteer Coordinator" },
            { fieldId: "date_start", label: "Start Date", type: "date", required: true },
            { fieldId: "date_end", label: "End Date", type: "date", required: true },
            { fieldId: "proof_upload", label: "Certificate of Appreciation", type: "file", required: true },
        ]
    },
    {
        templateName: "College_Magazine_Article",
        templateCategory: "Cultural",
        fields: [
            { fieldId: "article_title", label: "Article Title", type: "text", required: true },
            { fieldId: "magazine_name", label: "Magazine/Newsletter Name", type: "text", required: true },
            { fieldId: "publication_date", label: "Date of Publication", type: "date", required: true },
            { fieldId: "is_editor", label: "Was Author/Editor?", type: "select", required: true, options: ["Author", "Editor", "Co-Author"] },
            { fieldId: "proof_upload", label: "Scan of Published Page", type: "file", required: true },
        ]
    },
    {
        templateName: "Campus_Ambassador",
        templateCategory: "Cultural",
        fields: [
            { fieldId: "program_name", label: "Program Name", type: "text", required: true },
            { fieldId: "company_name", label: "Company/Institute", type: "text", required: true },
            { fieldId: "date_start", label: "Start Date", type: "date", required: true },
            { fieldId: "date_end", label: "End Date", type: "date", required: true },
            { fieldId: "description", label: "Key Responsibilities/Achievements", type: "textarea", required: true },
            { fieldId: "proof_upload", label: "Completion Certificate", type: "file", required: true },
        ]
    },
    // --- SPORTS CATEGORY (4) ---
    {
        templateName: "Inter_College_Sports",
        templateCategory: "Sports",
        fields: [
            { fieldId: "sport_name", label: "Sport Name", type: "text", required: true, placeholder: "e.g., Basketball, Chess, Athletics" },
            { fieldId: "event_name", label: "Tournament Name", type: "text", required: true },
            { fieldId: "level", label: "Level", type: "select", required: true, options: ["Inter-College", "State", "National"] },
            { fieldId: "date_held", label: "Date Held", type: "date", required: true },
            { fieldId: "position_achieved", label: "Position Achieved", type: "select", required: false, options: ["1st Place", "2nd Place", "3rd Place", "Participation"] },
            { fieldId: "proof_upload", label: "Medal/Certificate Photo", type: "file", required: true },
        ]
    },
    {
        templateName: "NCC_NSS_Activity",
        templateCategory: "Sports",
        fields: [
            { fieldId: "activity_type", label: "Activity Type", type: "select", required: true, options: ["Camp Attendance", "Blood Donation Drive", "Cleanliness Drive", "Training Session"] },
            { fieldId: "camp_name", label: "Camp/Event Name", type: "text", required: true, placeholder: "e.g., Annual Training Camp (ATC)" },
            { fieldId: "date_start", label: "Start Date", type: "date", required: true },
            { fieldId: "date_end", label: "End Date", type: "date", required: true },
            { fieldId: "proof_upload", label: "Proof/Certificate", type: "file", required: true },
        ]
    },
    {
        templateName: "Fitness_Competition",
        templateCategory: "Sports",
        fields: [
            { fieldId: "competition_name", label: "Competition Name", type: "text", required: true, placeholder: "e.g., College Marathon/Powerlifting" },
            { fieldId: "distance_time", label: "Distance/Time/Result", type: "text", required: true },
            { fieldId: "date_held", label: "Date Held", type: "date", required: true },
            { fieldId: "proof_upload", label: "Finishers Medal/Certificate", type: "file", required: true },
        ]
    },
    {
        templateName: "Sports_Referee_Umpire",
        templateCategory: "Sports",
        fields: [
            { fieldId: "role", label: "Role (Referee/Umpire)", type: "text", required: true },
            { fieldId: "tournament_name", label: "Tournament Name", type: "text", required: true },
            { fieldId: "date_held", label: "Date Held", type: "date", required: true },
            { fieldId: "proof_upload", label: "Appointment/Appreciation Letter", type: "file", required: true },
        ]
    },
    // --- PROFESSIONAL DEVELOPMENT CATEGORY (4) ---
    {
        templateName: "Industry_Internship",
        templateCategory: "Professional",
        fields: [
            { fieldId: "company_name", label: "Company Name", type: "text", required: true },
            { fieldId: "internship_role", label: "Role/Position", type: "text", required: true, placeholder: "e.g., Software Development Intern" },
            { fieldId: "date_start", label: "Start Date", type: "date", required: true },
            { fieldId: "date_end", label: "End Date", type: "date", required: true },
            { fieldId: "stipend", label: "Stipend (Optional, INR)", type: "number", required: false, min: 0 },
            { fieldId: "key_tasks", label: "Key Tasks/Project Description (Max 200 words)", type: "textarea", required: true },
            { fieldId: "proof_upload", label: "Internship Completion Certificate", type: "file", required: true },
        ]
    },
    {
        templateName: "Patent_Published",
        templateCategory: "Research",
        fields: [
            { fieldId: "patent_title", label: "Patent Title", type: "text", required: true },
            { fieldId: "inventors", label: "Co-Inventors (comma separated)", type: "text", required: false },
            { fieldId: "application_number", label: "Application Number", type: "text", required: true },
            { fieldId: "publication_date", label: "Date of Publication", type: "date", required: true },
            { fieldId: "proof_upload", label: "Publication Document", type: "file", required: true },
        ]
    },
    {
        templateName: "MOOC_Course",
        templateCategory: "Professional",
        fields: [
            { fieldId: "course_name", label: "Course Name", type: "text", required: true },
            { fieldId: "platform", label: "MOOC Platform", type: "select", required: true, options: ["edX", "Coursera", "SWAYAM", "FutureLearn", "Others"] },
            { fieldId: "date_completed", label: "Date Completed", type: "date", required: true },
            { fieldId: "proof_upload", label: "Certificate", type: "file", required: true },
        ]
    },
    {
        templateName: "Placement_Success",
        templateCategory: "Professional",
        fields: [
            { fieldId: "company_name", label: "Company Name", type: "text", required: true },
            { fieldId: "role", label: "Job Role", type: "text", required: true },
            { fieldId: "ctc", label: "CTC (LPA)", type: "number", required: true, min: 1 },
            { fieldId: "offer_date", label: "Offer Date", type: "date", required: true },
            { fieldId: "proof_upload", label: "Offer Letter PDF", type: "file", required: true },
        ]
    },
    // --- COMMUNITY & GENERAL (4) ---
    {
        templateName: "Social_Outreach_Program",
        templateCategory: "Community",
        fields: [
            { fieldId: "program_name", label: "Program Name", type: "text", required: true, placeholder: "e.g., Village Adoption Drive" },
            { fieldId: "date_held", label: "Date Held", type: "date", required: true },
            { fieldId: "hours_volunteered", label: "Hours Volunteered", type: "number", required: true, min: 1 },
            { fieldId: "description", label: "Description of Service", type: "textarea", required: true },
            { fieldId: "proof_upload", label: "Photo/Letter from Coordinator", type: "file", required: true },
        ]
    },
    {
        templateName: "Student_Club_Leadership",
        templateCategory: "Community",
        fields: [
            { fieldId: "club_name", label: "Club/Society Name", type: "text", required: true },
            { fieldId: "role", label: "Role", type: "select", required: true, options: ["President", "Vice-President", "Secretary", "Treasurer", "Coordinator"] },
            { fieldId: "date_start", label: "Start Date", type: "date", required: true },
            { fieldId: "date_end", label: "End Date", type: "date", required: true },
            { fieldId: "proof_upload", label: "Appointment Letter/ID Card Scan", type: "file", required: true },
        ]
    },
    {
        templateName: "Attended_Webinar",
        templateCategory: "General",
        fields: [
            { fieldId: "webinar_topic", label: "Webinar Topic", type: "text", required: true },
            { fieldId: "organized_by", label: "Organized By", type: "text", required: true },
            { fieldId: "date_attended", label: "Date Attended", type: "date", required: true },
            { fieldId: "link_proof", label: "Registration Confirmation/Link", type: "text", required: false },
        ]
    },
    {
        templateName: "Mentorship_Program",
        templateCategory: "Community",
        fields: [
            { fieldId: "program_name", label: "Mentorship Program Name", type: "text", required: true },
            { fieldId: "role", label: "Your Role", type: "select", required: true, options: ["Mentor", "Mentee"] },
            { fieldId: "date_start", label: "Start Date", type: "date", required: true },
            { fieldId: "date_end", label: "End Date", type: "date", required: true },
            { fieldId: "proof_upload", label: "Proof of Participation", type: "file", required: true },
        ]
    },
];

// --- SCRIPT TO RUN THE SEEDING ---
const seedDB = async () => {
  try {
    // 1. Connect to the database
    await mongoose.connect(process.env.MONGO_DB_URI);
    console.log('MongoDB connected for seeding...');

    // 2. Clear out any old templates
    await ActivityTemplate.deleteMany({});
    console.log('Old templates deleted.');

    // 3. Insert the new templates
    await ActivityTemplate.insertMany(templateData);
    console.log(`${templateData.length} templates have been added!`);

    // 4. Disconnect
    await mongoose.disconnect();
    console.log('MongoDB disconnected.');

  } catch (error) {
    console.error('Error seeding database:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

// Run the function
seedDB();