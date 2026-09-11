-- SQLite version of the database schema for Swastik Buildcons
-- This file creates the tables needed for the application to work with SQLite

CREATE TABLE IF NOT EXISTS Leads (
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    Name TEXT NOT NULL,
    Phone TEXT NOT NULL,
    Email TEXT,
    ProjectType TEXT NOT NULL,
    Budget TEXT NOT NULL,
    Message TEXT,
    Status TEXT DEFAULT 'New',
    Timeline TEXT,
    CreatedAtUtc TEXT DEFAULT (datetime('now','utc'))
);

CREATE INDEX IF NOT EXISTS IX_Leads_CreatedAtUtc ON Leads(CreatedAtUtc);
CREATE INDEX IF NOT EXISTS IX_Leads_Phone ON Leads(Phone);

CREATE TABLE IF NOT EXISTS IndustrialProjects (
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    ProjectName TEXT NOT NULL,
    ClientName TEXT NOT NULL,
    Location TEXT NOT NULL,
    StartDate TEXT,
    EstimatedCompletionDate TEXT,
    ActualCompletionDate TEXT,
    ProjectType TEXT NOT NULL,
    BudgetAmount REAL NOT NULL,
    ActualCostToDate REAL DEFAULT 0,
    Status TEXT NOT NULL,
    ProgressPercentage INTEGER DEFAULT 0,
    Description TEXT,
    ScopeOfWork TEXT,
    ProjectManager TEXT,
    CreatedAtUtc TEXT DEFAULT (datetime('now','utc')),
    UpdatedAtUtc TEXT DEFAULT (datetime('now','utc'))
);

CREATE INDEX IF NOT EXISTS IX_IndustrialProjects_Status ON IndustrialProjects(Status);
CREATE INDEX IF NOT EXISTS IX_IndustrialProjects_StartDate ON IndustrialProjects(StartDate);
CREATE INDEX IF NOT EXISTS IX_IndustrialProjects_EstimatedCompletionDate ON IndustrialProjects(EstimatedCompletionDate);