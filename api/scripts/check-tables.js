const fs = require('fs');
const path = require('path');

const tables = [
  'users',
  'topics',
  'testAttempts',
  'testQuestions',
  'tests',
  'subjects',
  'samplePaperSubjects',
  'samplePaperQuestionOptions',
  'samplePaperTopics',
  'samplePaperQuestions',
  'samplePaperViews',
  'samplePapers',
  'questionOptions',
  'questionBank',
  'questions',
  'notes',
  'interviewPrepTopics',
  'interviewPrepSubtopics',
  'interviewPrepJobRoles',
  'blogPosts',
  'blogCommentReplies',
  'blogComments',
  'notifications',
  'userNotificationRead',
  'userPushTokens',
  'userWebPushSubscriptions',
  'answers'
];

const srcDir = 'c:\\Users\\basant\\Documents\\Basant\\FinalProject\\ProjE\\api\\src';
const schemaDir = path.join(srcDir, 'database', 'schema');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      if (!dirPath.endsWith('schema')) {
        walkDir(dirPath, callback);
      }
    } else {
      if (dirPath.endsWith('.ts')) {
        callback(dirPath);
      }
    }
  });
}

const fileContents = [];
walkDir(srcDir, function(filePath) {
  fileContents.push(fs.readFileSync(filePath, 'utf-8'));
});

console.log("Files read:", fileContents.length);
const importedNames = new Set();
const importRegex = /import\s*\{([^}]+)\}\s*from\s*['"][^'"]*schema[^'"]*['"]/g;

for (const content of fileContents) {
  let match;
  while ((match = importRegex.exec(content)) !== null) {
    const names = match[1].split(',').map(n => n.trim()).filter(n => n);
    names.forEach(n => {
      // Handle aliased imports like `testAttempts as attempts`
      const baseName = n.split(' as ')[0].trim();
      importedNames.add(baseName);
    });
  }
}

const unused = tables.filter(t => !importedNames.has(t));
console.log("Unused tables: " + JSON.stringify(unused));
