// Enums
enum Interests {
  MachineLearning = "MachineLearning",
  DataScience = "DataScience",
  Sustainability = "Sustainability",
  GreenTechnology = "GreenTechnology",
  Leadership = "Leadership",
  Management = "Management",
  Communication = "Communication",
  ProjectManagement = "ProjectManagement",
  BusinessStrategy = "BusinessStrategy",
}


enum Categories {
    All = "All",
    Ai = "AI",
    Sustainability = "Sustainability",
    SoftSkills = "Soft Skills",
    Management = "Management",
}


enum SkillCategory {
    Soft = "Soft",
    Technical = "Technical", 
}

enum DificultyLevels {
    Beginner = "Beginner",
    Intermediate = "Intermediate",
    Advanced = "Advanced",
}


enum Status {
    NotStarted = "Not Started",
    InProgress = "In Progress",
    Completed = "Completed"
}

// User related interfaces
interface UserInterest {
    readonly id: string;
    readonly userId: number;
    interest: Interests;
    
}


interface User {
    readonly id: string
    name: string;
    profilePictureUrl: string;
    interests: UserInterest | null;
}


interface SignInUser {
    email: string;
    password: string;
}


interface SignUpUser {
    name: string;
    email: string;
    password: string;
}


interface UserProgress {
    readonly id: string;
    readonly userId: string;
    readonly learningPathId: string;
    progressPercentage: number;
    status: Status;
}


// Skill assessments related interfaces
interface SkillQuestion {
    id: string;
    name: string;
    category: SkillCategory;
}


interface SkillAssessment {
    readonly id: string;
    readonly userId: string;
}


interface SkillAssessmentItem {
    readonly id: string;
    readonly skillAssessmentId: string
    name: string;
    category: SkillCategory;
    rating: number;
}


// Achievements
interface Achievement {
    readonly id: string;
    badgeName: string;
    description: string;
    imageUrl: string;
}


interface UserAchievement {
    readonly id: string;
    readonly userId: string;
    achievementId: number;
    earnedAt: Date;
}


// Learning Paths
interface LearningPath {
    readonly id: string;
    title: string;
    description: string;
    category: Categories;
    dificultyLevel: DificultyLevels;
    imageUrl: string; 
    content: string;
}


// Recommendations
interface Recommendation {
    readonly id: string;
    readonly userId: string;
    readonly learningPathId: string;
    reason: string;
}

export type {
  Interests,
  User,
  SignInUser,
  SignUpUser,
  UserProgress,
  SkillAssessmentItem,
  SkillAssessment,
  Achievement,
  UserAchievement,
  LearningPath,
  Recommendation,
  UserInterest,
  SkillQuestion
};

export {Categories, Status, SkillCategory}
