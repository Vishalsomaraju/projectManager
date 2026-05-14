require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clear existing data
  await prisma.notification.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.taskLabel.deleteMany();
  await prisma.label.deleteMany();
  await prisma.taskWatcher.deleteMany();
  await prisma.attachment.deleteMany();
  await prisma.task.deleteMany();
  await prisma.column.deleteMany();
  await prisma.projectInvite.deleteMany();
  await prisma.projectMember.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();

  // Create Users
  const passwordHash = await bcrypt.hash('Password123!', 12);

  const alice = await prisma.user.create({
    data: {
      email: 'alice@demo.com',
      username: 'alice',
      displayName: 'Alice Johnson',
      passwordHash,
      avatarUrl: 'https://ui-avatars.com/api/?name=Alice+Johnson&background=6366F1&color=fff',
    },
  });

  const bob = await prisma.user.create({
    data: {
      email: 'bob@demo.com',
      username: 'bob',
      displayName: 'Bob Smith',
      passwordHash,
      avatarUrl: 'https://ui-avatars.com/api/?name=Bob+Smith&background=10B981&color=fff',
    },
  });

  console.log('Users created.');

  // Create Project
  const project = await prisma.project.create({
    data: {
      title: 'Product Roadmap',
      description: 'Main project for managing our upcoming product features and releases.',
      slug: 'product-roadmap',
      color: '#6366F1',
      icon: '🚀',
      ownerId: alice.id,
      members: {
        create: [
          { userId: alice.id, role: 'OWNER' },
          { userId: bob.id, role: 'MEMBER' },
        ],
      },
    },
  });

  console.log('Project created.');

  // Create Labels
  const labels = await Promise.all([
    prisma.label.create({ data: { name: 'Bug', color: '#EF4444', projectId: project.id } }),
    prisma.label.create({ data: { name: 'Feature', color: '#10B981', projectId: project.id } }),
    prisma.label.create({ data: { name: 'Design', color: '#8B5CF6', projectId: project.id } }),
    prisma.label.create({ data: { name: 'Docs', color: '#3B82F6', projectId: project.id } }),
  ]);

  console.log('Labels created.');

  // Create Columns
  const backLog = await prisma.column.create({
    data: { name: 'Backlog', order: 0, projectId: project.id, color: '#64748B' },
  });
  const inProgress = await prisma.column.create({
    data: { name: 'In Progress', order: 1, projectId: project.id, color: '#3B82F6' },
  });
  const inReview = await prisma.column.create({
    data: { name: 'In Review', order: 2, projectId: project.id, color: '#F59E0B' },
  });
  const done = await prisma.column.create({
    data: { name: 'Done', order: 3, projectId: project.id, color: '#10B981' },
  });

  console.log('Columns created.');

  // Create Tasks
  await prisma.task.create({
    data: {
      title: 'Fix login issue',
      description: 'Users are reporting intermittent failures on the login page.',
      projectId: project.id,
      columnId: backLog.id,
      order: 0,
      priority: 'HIGH',
      assigneeId: bob.id,
      labels: {
        create: [{ labelId: labels[0].id }],
      },
    },
  });

  await prisma.task.create({
    data: {
      title: 'Implement Dark Mode',
      description: 'Add dark mode support to the entire application.',
      projectId: project.id,
      columnId: inProgress.id,
      order: 0,
      priority: 'MEDIUM',
      assigneeId: alice.id,
      labels: {
        create: [{ labelId: labels[1].id }, { labelId: labels[2].id }],
      },
    },
  });

  await prisma.task.create({
    data: {
      title: 'Update API Documentation',
      description: 'Document all new endpoints added in the last sprint.',
      projectId: project.id,
      columnId: inProgress.id,
      order: 1,
      priority: 'LOW',
      labels: {
        create: [{ labelId: labels[3].id }],
      },
    },
  });

  await prisma.task.create({
    data: {
      title: 'Dashboard Redesign',
      description: 'Redesign the dashboard to include real-time metrics.',
      projectId: project.id,
      columnId: inReview.id,
      order: 0,
      priority: 'URGENT',
      assigneeId: alice.id,
      labels: {
        create: [{ labelId: labels[2].id }],
      },
    },
  });

  await prisma.task.create({
    data: {
      title: 'Setup Redis Caching',
      description: 'Optimize performance by adding Redis cache to expensive queries.',
      projectId: project.id,
      columnId: done.id,
      order: 0,
      priority: 'MEDIUM',
    },
  });

  await prisma.task.create({
    data: {
      title: 'Initial Database Setup',
      description: 'Configure PostgreSQL and Prisma ORM.',
      projectId: project.id,
      columnId: done.id,
      order: 1,
      priority: 'HIGH',
      completedAt: new Date(),
    },
  });

  console.log('Tasks created.');
  console.log('Seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
