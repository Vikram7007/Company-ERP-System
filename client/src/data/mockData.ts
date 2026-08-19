import { Domain, Student, Mentor, LiveClass, RecordedLecture, Assignment, Certificate, Announcement, JobPosting, Quiz, StudentApplication } from '../types';

export const INITIAL_DOMAINS: Domain[] = [
  {
    id: 'dom-1',
    name: 'MERN Stack Development',
    category: 'Web Development',
    iconName: 'Code',
    studentsEnrolled: 245,
    durationWeeks: 12,
    description: 'Master MongoDB, Express.js, React 19, Node.js, and TypeScript building enterprise SaaS solutions.',
    syllabus: [
      {
        week: 1,
        title: 'HTML5, CSS3 & Modern JavaScript (ES6+)',
        status: 'Completed',
        progressPercent: 100,
        lessonsCompleted: 8,
        totalLessons: 8,
        topics: ['Semantic HTML', 'Forms & Validation', 'Flexbox & CSS Grid', 'Responsive Web Design', 'ES6+ Syntax', 'DOM Manipulation', 'Async JavaScript', 'Fetch API'],
        practicalProject: 'Build a responsive portfolio website with CSS Grid & Flexbox',
        lessons: [
          { id: 'm-w1-l1', title: 'Semantic HTML5 & Accessibility', duration: '35m', objectives: ['Use semantic tags (header, nav, section, article)', 'Implement accessible form controls'], completed: true },
          { id: 'm-w1-l2', title: 'CSS3 Flexbox & Grid Masterclass', duration: '45m', objectives: ['Master 1D and 2D responsive layouts', 'Build fluid mobile-first grids'], completed: true },
          { id: 'm-w1-l3', title: 'Modern JavaScript (ES6+) Core Concepts', duration: '50m', objectives: ['Understand let/const, arrow functions, destructuring', 'Master spread and rest operators'], completed: true },
          { id: 'm-w1-l4', title: 'Async JS: Promises, Async/Await & Fetch', duration: '40m', objectives: ['Handle asynchronous operations using Promises', 'Fetch external API data using async/await'], completed: true }
        ]
      },
      {
        week: 2,
        title: 'Advanced JavaScript & ES6+ Mastery',
        status: 'Completed',
        progressPercent: 100,
        lessonsCompleted: 8,
        totalLessons: 8,
        topics: ['Scope & Hoisting', 'Closures', 'Event Loop & Call Stack', 'Web APIs', 'Local & Session Storage', 'JSON & Modules', 'Error Handling', 'API Integration'],
        practicalProject: 'Build a JavaScript API-based application with dynamic data rendering',
        lessons: [
          { id: 'm-w2-l1', title: 'Scope, Hoisting & Execution Context', duration: '40m', objectives: ['Understand lexical scope and closures', 'Avoid variable scope pollution'], completed: true },
          { id: 'm-w2-l2', title: 'Event Loop & Asynchronous Architecture', duration: '45m', objectives: ['Understand Call Stack, Microtask queue and Macro tasks'], completed: true }
        ]
      },
      {
        week: 3,
        title: 'React Fundamentals & Hooks',
        status: 'Completed',
        progressPercent: 100,
        lessonsCompleted: 7,
        totalLessons: 7,
        topics: ['React Intro & Vite', 'JSX & Components', 'Props & State Management', 'Hooks: useState & useEffect', 'useRef & Controlled Forms', 'Conditional Rendering', 'Tailwind CSS Integration'],
        practicalProject: 'Build a Student Management Dashboard with React & Tailwind CSS',
        lessons: [
          { id: 'm-w3-l1', title: 'React 19 Core Architecture & Vite Setup', duration: '35m', objectives: ['Initialize React 19 apps with Vite', 'Understand JSX rendering pipeline'], completed: true },
          { id: 'm-w3-l2', title: 'State Management with useState & useEffect', duration: '50m', objectives: ['Manage component state and side effects', 'Prevent infinite re-render loops'], completed: true }
        ]
      },
      {
        week: 4,
        title: 'Advanced React & State Management',
        status: 'Completed',
        progressPercent: 100,
        lessonsCompleted: 6,
        totalLessons: 6,
        topics: ['Custom Hooks', 'Context API', 'React Router v6', 'Protected Routes', 'Form Validation', 'Axios & API Integration', 'Component Optimization'],
        practicalProject: 'Build a complete authentication-based React application',
        lessons: [
          { id: 'm-w4-l1', title: 'Global State Management with Context API', duration: '45m', objectives: ['Share global auth and data context across tree', 'Optimize Context provider re-renders'], completed: true }
        ]
      },
      {
        week: 5,
        title: 'Node.js & Express Architecture',
        status: 'In Progress',
        progressPercent: 70,
        lessonsCompleted: 6,
        totalLessons: 8,
        topics: ['Node.js Modules & fs', 'npm Package Manager', 'Events & Streams', 'Environment Variables', 'Express Intro', 'Middleware Architecture', 'REST API Endpoints'],
        practicalProject: 'Build a REST API using Node.js, Express & Custom Middleware',
        lessons: [
          { id: 'm-w5-l1', title: 'Node.js Runtime & Built-in Modules', duration: '40m', objectives: ['Understand Node event loop and non-blocking I/O', 'Use fs and path modules'], completed: true },
          { id: 'm-w5-l2', title: 'Express Routing & Middleware Architecture', duration: '50m', objectives: ['Create modular Express routers', 'Build custom authentication middleware'], completed: false }
        ]
      },
      {
        week: 6,
        title: 'Express.js & Production REST API Architecture',
        status: 'Not Started',
        progressPercent: 0,
        lessonsCompleted: 0,
        totalLessons: 7,
        topics: ['Express Architecture', 'Routes & Controllers', 'Auth Middleware', 'HTTP Status Codes', 'API Validation', 'Pagination & Filtering', 'CORS Configuration'],
        practicalProject: 'Build a production-style REST API with searching, pagination & filtering',
        lessons: [
          { id: 'm-w6-l1', title: 'MVC Architecture in Express.js', duration: '45m', objectives: ['Separate routes, controllers and data models', 'Standardize HTTP response format'], completed: false }
        ]
      },
      {
        week: 7,
        title: 'Database Design, MongoDB & Mongoose ODM',
        status: 'Not Started',
        progressPercent: 0,
        lessonsCompleted: 0,
        totalLessons: 8,
        topics: ['MongoDB Collections & Docs', 'CRUD Operations', 'MongoDB Atlas Setup', 'Mongoose Schemas & Models', 'Validation Rules', 'Document Relationships', 'populate() Method', 'Aggregation Pipeline'],
        practicalProject: 'Create a complete MongoDB database for an internship management system',
        lessons: [
          { id: 'm-w7-l1', title: 'Mongoose Schemas, Models & Validation', duration: '45m', objectives: ['Define strongly typed Mongoose schemas', 'Implement field level validation rules'], completed: false }
        ]
      },
      {
        week: 8,
        title: 'Enterprise Authentication & Authorization',
        status: 'Not Started',
        progressPercent: 0,
        lessonsCompleted: 0,
        totalLessons: 7,
        topics: ['User Registration & Login', 'Password Hashing with bcrypt', 'JWT Access Tokens', 'Refresh Tokens & Cookies', 'Protected Routes', 'Role-Based Access Control (RBAC)'],
        practicalProject: 'Build complete authentication and role-based authorization system',
        lessons: [
          { id: 'm-w8-l1', title: 'JWT Authentication & Refresh Tokens', duration: '50m', objectives: ['Issue secure HTTP-only cookie JWT tokens', 'Implement refresh token rotation'], completed: false }
        ]
      },
      {
        week: 9,
        title: 'Full Stack MERN Integration & Media Uploads',
        status: 'Not Started',
        progressPercent: 0,
        lessonsCompleted: 0,
        totalLessons: 6,
        topics: ['React + Node Integration', 'Axios API Services', 'Global Auth State', 'Backend Validation Handling', 'File Upload with Multer', 'Cloudinary Media Hosting'],
        practicalProject: 'Connect React frontend with Node.js + MongoDB backend',
        lessons: [
          { id: 'm-w9-l1', title: 'Connecting React Frontend with Node.js Backend', duration: '45m', objectives: ['Configure CORS and Axios intercepters', 'Sync client state with API data'], completed: false }
        ]
      },
      {
        week: 10,
        title: 'Advanced MERN: Redux Toolkit & Socket.IO',
        status: 'Locked',
        progressPercent: 0,
        lessonsCompleted: 0,
        totalLessons: 6,
        topics: ['Redux Toolkit Setup', 'React Query Caching', 'Lazy Loading & Code Splitting', 'API Caching Strategies', 'Real-time Communication', 'Socket.IO Events'],
        practicalProject: 'Build a real-time notification and chat feature using Socket.IO',
        lessons: [
          { id: 'm-w10-l1', title: 'Real-time WebSockets with Socket.IO', duration: '55m', objectives: ['Implement bi-directional event emission', 'Build real-time student notification alerts'], completed: false }
        ]
      },
      {
        week: 11,
        title: 'Deployment, CI/CD & Cloud Infrastructure',
        status: 'Locked',
        progressPercent: 0,
        lessonsCompleted: 0,
        totalLessons: 5,
        topics: ['Git & GitHub Workflows', 'Frontend Deployment (Vercel/Netlify)', 'Backend Cloud Deployment (Render)', 'MongoDB Atlas Whitelisting', 'Production Security Best Practices'],
        practicalProject: 'Deploy the complete MERN application on Vercel and Render cloud',
        lessons: [
          { id: 'm-w11-l1', title: 'Deploying MERN Stack Apps to Production', duration: '50m', objectives: ['Configure environment variables on Render and Vercel', 'Enable HTTPS & CORS protection'], completed: false }
        ]
      },
      {
        week: 12,
        title: 'Final Enterprise Industry Capstone Project',
        status: 'Locked',
        progressPercent: 0,
        lessonsCompleted: 0,
        totalLessons: 5,
        topics: ['Full-Stack Architecture', 'Authentication & Authorization', 'Admin & Student Dashboards', 'MongoDB Aggregations', 'Deployment & Live Demo', 'Code Review & Documentation'],
        practicalProject: 'Build, test, and present a complete production-level MERN SaaS application',
        lessons: [
          { id: 'm-w12-l1', title: 'Final Capstone Project Presentation & Evaluation', duration: '60m', objectives: ['Present production application code and UI', 'Complete peer review and mentor evaluation'], completed: false }
        ]
      }
    ]
  },
  {
    id: 'dom-2',
    name: 'Artificial Intelligence & Deep Learning',
    category: 'Data & AI',
    iconName: 'Bot',
    studentsEnrolled: 189,
    durationWeeks: 12,
    description: 'Build neural networks, Computer Vision models, and LLM AI agents using Python and PyTorch.',
    syllabus: [
      {
        week: 1,
        title: 'Python for AI & Math Foundations',
        status: 'Completed',
        progressPercent: 100,
        lessonsCompleted: 6,
        totalLessons: 6,
        topics: ['NumPy', 'Linear Algebra', 'Calculus for ML', 'Probability & Statistics', 'Vectorization'],
        practicalProject: 'Build a NumPy matrix math library from scratch',
        lessons: [
          { id: 'ai-w1-l1', title: 'Vector & Matrix Operations in NumPy', duration: '40m', objectives: ['Understand dot products and matrix multiplication', 'Implement vectorized computation'], completed: true },
          { id: 'ai-w1-l2', title: 'Calculus & Gradient Descent Essentials', duration: '45m', objectives: ['Compute partial derivatives', 'Understand optimization algorithms'], completed: true }
        ]
      },
      {
        week: 2,
        title: 'Neural Networks & PyTorch Fundamentals',
        status: 'In Progress',
        progressPercent: 60,
        lessonsCompleted: 3,
        totalLessons: 5,
        topics: ['Perceptrons', 'Backpropagation', 'Activation Functions', 'PyTorch Tensors', 'Autograd Engine'],
        practicalProject: 'Train a PyTorch Multi-Layer Perceptron on MNIST dataset',
        lessons: [
          { id: 'ai-w2-l1', title: 'Building Neural Nets from Scratch in PyTorch', duration: '50m', objectives: ['Define custom nn.Module classes', 'Implement loss functions and optimizers'], completed: true },
          { id: 'ai-w2-l2', title: 'Backpropagation & Autograd Graph', duration: '45m', objectives: ['Debug gradient computation', 'Prevent vanishing gradients'], completed: false }
        ]
      },
      {
        week: 3,
        title: 'Computer Vision & CNN Architectures',
        status: 'Not Started',
        progressPercent: 0,
        lessonsCompleted: 0,
        totalLessons: 5,
        topics: ['OpenCV', 'Convolutional Layers', 'ResNet Architecture', 'YOLO Object Detection'],
        practicalProject: 'Build a real-time object detection model with YOLO',
        lessons: [
          { id: 'ai-w3-l1', title: 'CNN Convolutions & Feature Extraction', duration: '45m', objectives: ['Build 2D convolution filters', 'Apply max pooling and BatchNorm'], completed: false }
        ]
      },
      {
        week: 4,
        title: 'Natural Language Processing & Transformers',
        status: 'Not Started',
        progressPercent: 0,
        lessonsCompleted: 0,
        totalLessons: 6,
        topics: ['Tokenization', 'Attention Mechanism', 'BERT', 'LLM Fine-tuning with Hugging Face'],
        practicalProject: 'Fine-tune an LLM on domain-specific customer support dataset',
        lessons: [
          { id: 'ai-w4-l1', title: 'Self-Attention & Transformer Architecture', duration: '55m', objectives: ['Understand query-key-value attention', 'Implement multi-head attention'], completed: false }
        ]
      }
    ]
  },
  {
    id: 'dom-4',
    name: 'Data Science & Data Analytics',
    category: 'Data & AI',
    iconName: 'BarChart3',
    studentsEnrolled: 210,
    durationWeeks: 10,
    description: 'Data wrangling, statistical analysis, interactive dashboards with Power BI and SQL.',
    syllabus: [
      {
        week: 1,
        title: 'SQL Databases & Advanced Querying',
        status: 'Completed',
        progressPercent: 100,
        lessonsCompleted: 5,
        totalLessons: 5,
        topics: ['SQL Joins', 'Aggregations', 'Subqueries', 'Window Functions', 'Query Optimization'],
        practicalProject: 'Query enterprise database to produce quarterly revenue reports',
        lessons: [
          { id: 'ds-w1-l1', title: 'Advanced SQL Joins & Window Functions', duration: '45m', objectives: ['Master INNER/LEFT/FULL OUTER joins', 'Use OVER(), ROW_NUMBER() and RANK()'], completed: true }
        ]
      },
      {
        week: 2,
        title: 'Pandas, Data Cleaning & Exploratory Data Analysis',
        status: 'In Progress',
        progressPercent: 50,
        lessonsCompleted: 3,
        totalLessons: 6,
        topics: ['Pandas DataFrames', 'Missing Values', 'Outlier Detection', 'Data Wrangling'],
        practicalProject: 'Clean and analyze a 50,000-row real estate dataset',
        lessons: [
          { id: 'ds-w2-l1', title: 'EDA & Feature Engineering with Pandas', duration: '40m', objectives: ['Clean null values and outliers', 'Perform group aggregations'], completed: true }
        ]
      },
      {
        week: 3,
        title: 'Power BI, DAX & Business Dashboards',
        status: 'Not Started',
        progressPercent: 0,
        lessonsCompleted: 0,
        totalLessons: 5,
        topics: ['DAX Formulas', 'Interactive Reports', 'Data Modeling', 'Power Query ETL'],
        practicalProject: 'Build an executive Power BI sales dashboard',
        lessons: [
          { id: 'ds-w3-l1', title: 'Building Interactive Power BI Dashboards', duration: '50m', objectives: ['Connect data sources via Power Query', 'Write DAX measures for KPI metrics'], completed: false }
        ]
      }
    ]
  },
  {
    id: 'dom-8',
    name: 'Full Stack Java Development',
    category: 'Software Engineering',
    iconName: 'Coffee',
    studentsEnrolled: 195,
    durationWeeks: 12,
    description: 'Java 21, Spring Boot 3, Microservices, Hibernate ORM, and React Frontend integration.',
    syllabus: [
      {
        week: 1,
        title: 'Core Java 21 & OOPs Principles',
        status: 'Completed',
        progressPercent: 100,
        lessonsCompleted: 6,
        totalLessons: 6,
        topics: ['Classes & Objects', 'Inheritance & Polymorphism', 'Collections Framework', 'Lambdas & Streams'],
        practicalProject: 'Build a Java Command-Line Bank Management System',
        lessons: [
          { id: 'jav-w1-l1', title: 'Java 21 Virtual Threads & Modern Features', duration: '40m', objectives: ['Understand OOPs principles', 'Master Streams API and Records'], completed: true }
        ]
      },
      {
        week: 2,
        title: 'Spring Boot 3 REST APIs & Spring Data JPA',
        status: 'In Progress',
        progressPercent: 50,
        lessonsCompleted: 3,
        totalLessons: 6,
        topics: ['Spring MVC Architecture', 'Dependency Injection', 'Spring Data JPA & Hibernate', 'REST Endpoints'],
        practicalProject: 'Build a Spring Boot REST API for E-Commerce Catalog',
        lessons: [
          { id: 'jav-w2-l1', title: 'Spring Boot Controllers & Spring Data JPA', duration: '50m', objectives: ['Create REST controllers', 'Map database entities using JPA annotations'], completed: true }
        ]
      }
    ]
  },
  {
    id: 'dom-web',
    name: 'Web Development',
    category: 'Web Development',
    iconName: 'Layout',
    studentsEnrolled: 220,
    durationWeeks: 12,
    description: 'Modern web development with HTML5, CSS3 Grid, JavaScript ES6+, React, and Responsive Web Design.',
    syllabus: [
      {
        week: 1,
        title: 'HTML5 Semantic Web & Modern CSS3',
        status: 'Completed',
        progressPercent: 100,
        lessonsCompleted: 6,
        totalLessons: 6,
        topics: ['Semantic HTML', 'CSS Flexbox', 'CSS Grid', 'Media Queries & Responsive Design'],
        practicalProject: 'Build a multi-page responsive corporate website',
        lessons: [
          { id: 'web-w1-l1', title: 'HTML5 Layouts & Modern CSS Grid', duration: '35m', objectives: ['Build fluid layouts', 'Implement accessible HTML markup'], completed: true }
        ]
      },
      {
        week: 2,
        title: 'JavaScript DOM & Interactive Web Pages',
        status: 'In Progress',
        progressPercent: 60,
        lessonsCompleted: 4,
        totalLessons: 6,
        topics: ['DOM Events', 'Form Validation', 'Local Storage', 'Fetch API Integration'],
        practicalProject: 'Build an interactive web task tracker',
        lessons: [
          { id: 'web-w2-l1', title: 'DOM Manipulation & Dynamic Rendering', duration: '40m', objectives: ['Bind event listeners', 'Store user preferences in LocalStorage'], completed: true }
        ]
      }
    ]
  },
  {
    id: 'dom-python',
    name: 'Python Development',
    category: 'Software Engineering',
    iconName: 'Terminal',
    studentsEnrolled: 175,
    durationWeeks: 12,
    description: 'Master Python 3.12, Django 5, FastAPI, PostgreSQL, and Automated Testing.',
    syllabus: [
      {
        week: 1,
        title: 'Python Core Essentials & OOP',
        status: 'Completed',
        progressPercent: 100,
        lessonsCompleted: 6,
        totalLessons: 6,
        topics: ['Data Structures', 'Functions & Generators', 'OOP Classes', 'File I/O & Modules'],
        practicalProject: 'Build a Python File Management CLI Tool',
        lessons: [
          { id: 'py-w1-l1', title: 'Object Oriented Programming in Python 3.12', duration: '40m', objectives: ['Implement dunder methods and inheritance', 'Use decorators and generators'], completed: true }
        ]
      },
      {
        week: 2,
        title: 'FastAPI & Production REST Services',
        status: 'In Progress',
        progressPercent: 50,
        lessonsCompleted: 3,
        totalLessons: 6,
        topics: ['AsyncIO', 'Pydantic Schemas', 'Swagger Docs', 'SQLAlchemy ORM'],
        practicalProject: 'Build an Async FastAPI Microservice with PostgreSQL',
        lessons: [
          { id: 'py-w2-l1', title: 'Async Microservices with FastAPI & Pydantic', duration: '45m', objectives: ['Write async request handlers', 'Validate payloads with Pydantic v2'], completed: true }
        ]
      }
    ]
  },
  {
    id: 'dom-app',
    name: 'Mobile & Flutter App Development',
    category: 'Mobile Development',
    iconName: 'Smartphone',
    studentsEnrolled: 160,
    durationWeeks: 12,
    description: 'Cross-platform iOS and Android mobile apps using Dart, Flutter 3, Firebase, and BLoC State Management.',
    syllabus: [
      {
        week: 1,
        title: 'Dart Programming & Flutter Widgets',
        status: 'Completed',
        progressPercent: 100,
        lessonsCompleted: 5,
        totalLessons: 5,
        topics: ['Dart Syntax', 'Stateless vs Stateful Widgets', 'Layout Widgets', 'Material Design 3'],
        practicalProject: 'Build a Cross-Platform Expense Tracker App',
        lessons: [
          { id: 'flt-w1-l1', title: 'Flutter 3 UI Tree & Custom Widgets', duration: '45m', objectives: ['Build responsive mobile screens', 'Handle touch gestures and state'], completed: true }
        ]
      },
      {
        week: 2,
        title: 'Flutter BLoC State Management & REST APIs',
        status: 'In Progress',
        progressPercent: 40,
        lessonsCompleted: 2,
        totalLessons: 5,
        topics: ['BLoC Pattern', 'Cubit', 'Dio HTTP Client', 'JSON Serialization'],
        practicalProject: 'Build a News Reader App with live REST API integration',
        lessons: [
          { id: 'flt-w2-l1', title: 'State Sync with BLoC & RxDart', duration: '50m', objectives: ['Separate UI from business logic', 'Emit immutable UI states'], completed: false }
        ]
      }
    ]
  },
  {
    id: 'dom-dataeng',
    name: 'Data Engineering',
    category: 'Data & AI',
    iconName: 'Database',
    studentsEnrolled: 140,
    durationWeeks: 12,
    description: 'Big Data Pipelines, Apache Spark, Airflow DAGs, Snowflake Data Warehouse, and Kafka Streaming.',
    syllabus: [
      {
        week: 1,
        title: 'Distributed Systems & Apache Spark',
        status: 'Completed',
        progressPercent: 100,
        lessonsCompleted: 5,
        totalLessons: 5,
        topics: ['PySpark DataFrames', 'Spark RDDs', 'Partitioning', 'ETL Pipelines'],
        practicalProject: 'Process 10 Million Records using PySpark on Databricks',
        lessons: [
          { id: 'de-w1-l1', title: 'PySpark Distributed Data Processing', duration: '50m', objectives: ['Optimize Spark shuffles and partitions', 'Perform distributed aggregations'], completed: true }
        ]
      },
      {
        week: 2,
        title: 'Workflow Automation with Apache Airflow',
        status: 'In Progress',
        progressPercent: 50,
        lessonsCompleted: 3,
        totalLessons: 6,
        topics: ['DAG Creation', 'Airflow Operators', 'XComs', 'Task Scheduling'],
        practicalProject: 'Build an automated ETL pipeline with Apache Airflow',
        lessons: [
          { id: 'de-w2-l1', title: 'Airflow DAG Architecture & Task Dependencies', duration: '45m', objectives: ['Design resilient DAG workflows', 'Monitor pipeline execution'], completed: true }
        ]
      }
    ]
  },
  {
    id: 'dom-uiux',
    name: 'UI/UX Design & Product Strategy',
    category: 'Design & Strategy',
    iconName: 'Figma',
    studentsEnrolled: 185,
    durationWeeks: 10,
    description: 'Figma Auto-Layout, Wireframing, High-Fidelity Prototyping, Usability Testing, and Design Systems.',
    syllabus: [
      {
        week: 1,
        title: 'UX Research, Personas & Information Architecture',
        status: 'Completed',
        progressPercent: 100,
        lessonsCompleted: 5,
        totalLessons: 5,
        topics: ['User Personas', 'User Journey Mapping', 'Information Architecture', 'Wireframing'],
        practicalProject: 'Create User Flow & Wireframes for a FinTech Mobile App',
        lessons: [
          { id: 'ux-w1-l1', title: 'UX Research & User Persona Crafting', duration: '40m', objectives: ['Conduct user interviews', 'Map end-to-end user journeys'], completed: true }
        ]
      },
      {
        week: 2,
        title: 'Figma Auto-Layout & Design Tokens',
        status: 'In Progress',
        progressPercent: 70,
        lessonsCompleted: 4,
        totalLessons: 6,
        topics: ['Auto-Layout 5.0', 'Variants', 'Design System Tokens', 'Interactive Components'],
        practicalProject: 'Build a Design System in Figma with 50+ Component Variants',
        lessons: [
          { id: 'ux-w2-l1', title: 'Mastering Figma Auto-Layout & Variants', duration: '50m', objectives: ['Create responsive component variants', 'Tokenize colors and typography'], completed: true }
        ]
      }
    ]
  },
  {
    id: 'dom-cloud',
    name: 'DevOps & Cloud Computing (AWS/Docker)',
    category: 'Cloud & Infrastructure',
    iconName: 'Cloud',
    studentsEnrolled: 230,
    durationWeeks: 12,
    description: 'AWS Cloud Services, Docker Containerization, Kubernetes, Terraform IaC, and GitHub Actions CI/CD.',
    syllabus: [
      {
        week: 1,
        title: 'Docker Containerization Masterclass',
        status: 'Completed',
        progressPercent: 100,
        lessonsCompleted: 6,
        totalLessons: 6,
        topics: ['Dockerfiles', 'Image Optimization', 'Docker Compose', 'Container Networking'],
        practicalProject: 'Containerize a Multi-Container Full-Stack Application with Docker Compose',
        lessons: [
          { id: 'cld-w1-l1', title: 'Writing Multi-Stage Production Dockerfiles', duration: '45m', objectives: ['Minimize image sizes', 'Configure environment variables'], completed: true }
        ]
      },
      {
        week: 2,
        title: 'AWS Core Services & Infrastructure',
        status: 'In Progress',
        progressPercent: 50,
        lessonsCompleted: 3,
        totalLessons: 6,
        topics: ['AWS EC2', 'S3 Buckets', 'VPC Subnets', 'IAM Security Policies', 'Route 53'],
        practicalProject: 'Deploy a resilient AWS EC2 + S3 infrastructure with IAM permissions',
        lessons: [
          { id: 'cld-w2-l1', title: 'AWS EC2, VPC & Security Group Setup', duration: '50m', objectives: ['Provision VPC subnets', 'Configure SSH and security groups'], completed: true }
        ]
      }
    ]
  },
  {
    id: 'dom-cyber',
    name: 'Cyber Security & Ethical Hacking',
    category: 'Security',
    iconName: 'ShieldAlert',
    studentsEnrolled: 155,
    durationWeeks: 12,
    description: 'Penetration Testing, OWASP Top 10, Network Security, Wireshark Packet Analysis, and Cryptography.',
    syllabus: [
      {
        week: 1,
        title: 'Network Security & Wireshark Packet Analysis',
        status: 'Completed',
        progressPercent: 100,
        lessonsCompleted: 5,
        totalLessons: 5,
        topics: ['TCP/IP Protocol Stack', 'Wireshark Filtering', 'Port Scanning with Nmap', 'DNS Vulnerabilities'],
        practicalProject: 'Perform Network Traffic Analysis & Identify Malicious Packets in Wireshark',
        lessons: [
          { id: 'cy-w1-l1', title: 'Network Reconnaissance with Nmap & Wireshark', duration: '45m', objectives: ['Scan network ports safely', 'Analyze packet captures'], completed: true }
        ]
      },
      {
        week: 2,
        title: 'Web Application Security & OWASP Top 10',
        status: 'In Progress',
        progressPercent: 60,
        lessonsCompleted: 3,
        totalLessons: 5,
        topics: ['SQL Injection', 'Cross-Site Scripting (XSS)', 'CSRF Attacks', 'Burp Suite'],
        practicalProject: 'Penetration Test a vulnerable web application using Burp Suite',
        lessons: [
          { id: 'cy-w2-l1', title: 'Exploiting & Patching OWASP Vulnerabilities', duration: '50m', objectives: ['Test for SQLi and XSS', 'Implement input sanitization'], completed: true }
        ]
      }
    ]
  }
];


export const INITIAL_STUDENTS: Student[] = [
  {
    id: 'std-101',
    userId: 'usr-student-1',
    name: 'Aarav Sharma',
    email: 'aarav.sharma@example.com',
    phone: '+91 98765 43210',
    domain: 'MERN Stack Development',
    batch: 'Batch W-2026-A',
    mentorName: 'Dr. Rajesh Verma',
    profileCompletion: 95,
    attendancePercentage: 96,
    assignmentsSubmitted: 8,
    totalAssignments: 8,
    averageGrade: '96%',
    joinedDate: '2026-06-01',
    status: 'Active',
    college: 'IIT Delhi',
    githubUrl: 'https://github.com/aarav-sharma',
    linkedinUrl: 'https://linkedin.com/in/aaravsharma',
    feeDetails: {
      totalFee: 15000,
      paidAmount: 15000,
      pendingAmount: 0,
      status: 'Paid',
      transactions: [
        { id: 'tx-1', amount: 7500, date: '2026-06-01', paymentMode: 'UPI / GPay', receiptNo: 'WEB-REC-101' },
        { id: 'tx-2', amount: 7500, date: '2026-07-01', paymentMode: 'Bank Transfer / NEFT', receiptNo: 'WEB-REC-204' }
      ]
    }
  },
  {
    id: 'std-102',
    userId: 'usr-student-2',
    name: 'Ananya Gupta',
    email: 'ananya.gupta@example.com',
    phone: '+91 98123 45678',
    domain: 'Artificial Intelligence & Deep Learning',
    batch: 'Batch W-2026-B',
    mentorName: 'Prof. Ankit Mehta',
    profileCompletion: 90,
    attendancePercentage: 92,
    assignmentsSubmitted: 7,
    totalAssignments: 8,
    averageGrade: '91%',
    joinedDate: '2026-06-01',
    status: 'Active',
    college: 'BITS Pilani',
    githubUrl: 'https://github.com/ananya-g',
    linkedinUrl: 'https://linkedin.com/in/ananyagupta',
    feeDetails: {
      totalFee: 18000,
      paidAmount: 10000,
      pendingAmount: 8000,
      status: 'Partial',
      transactions: [
        { id: 'tx-3', amount: 10000, date: '2026-06-01', paymentMode: 'UPI / GPay', receiptNo: 'WEB-REC-109' }
      ]
    }
  },
  {
    id: 'std-103',
    userId: 'usr-student-3',
    name: 'Rohan Kulkarni',
    email: 'rohan.kulkarni@example.com',
    phone: '+91 97654 32109',
    domain: 'DevOps & Cloud Computing (AWS/Docker)',
    batch: 'Batch W-2026-A',
    mentorName: 'Priya Sundaram',
    profileCompletion: 85,
    attendancePercentage: 88,
    assignmentsSubmitted: 6,
    totalAssignments: 8,
    averageGrade: '85%',
    joinedDate: '2026-06-15',
    status: 'Active',
    college: 'NIT Trichy',
    feeDetails: {
      totalFee: 15000,
      paidAmount: 5000,
      pendingAmount: 10000,
      status: 'Partial',
      transactions: [
        { id: 'tx-4', amount: 5000, date: '2026-06-15', paymentMode: 'Cash', receiptNo: 'WEB-REC-152' }
      ]
    }
  },
  {
    id: 'std-104',
    userId: 'usr-student-4',
    name: 'Sneha Patel',
    email: 'sneha.patel@example.com',
    phone: '+91 99887 76655',
    domain: 'UI/UX Design & Product Strategy',
    batch: 'Batch W-2026-C',
    mentorName: 'Kavita Reddy',
    profileCompletion: 100,
    attendancePercentage: 98,
    assignmentsSubmitted: 8,
    totalAssignments: 8,
    averageGrade: '98%',
    joinedDate: '2026-05-10',
    status: 'Completed',
    college: 'NID Ahmedabad',
    feeDetails: {
      totalFee: 12000,
      paidAmount: 12000,
      pendingAmount: 0,
      status: 'Paid',
      transactions: [
        { id: 'tx-5', amount: 12000, date: '2026-05-10', paymentMode: 'Credit / Debit Card', receiptNo: 'WEB-REC-088' }
      ]
    }
  },
  {
    id: 'std-105',
    userId: 'usr-student-5',
    name: 'Vikram Singh',
    email: 'vikram.singh@example.com',
    phone: '+91 91234 56789',
    domain: 'MERN Stack Development',
    batch: 'Batch W-2026-A',
    mentorName: 'Dr. Rajesh Verma',
    profileCompletion: 88,
    attendancePercentage: 90,
    assignmentsSubmitted: 7,
    totalAssignments: 8,
    averageGrade: '89%',
    joinedDate: '2026-06-01',
    status: 'Active',
    college: 'VIT Vellore',
    feeDetails: {
      totalFee: 15000,
      paidAmount: 0,
      pendingAmount: 15000,
      status: 'Unpaid',
      transactions: []
    }
  }
];

export const INITIAL_APPLICATIONS: StudentApplication[] = [
  {
    id: 'app-501',
    applicantName: 'Pratham Joshi',
    email: 'pratham.j@gmail.com',
    phone: '+91 98220 44556',
    domain: 'MERN Stack Development',
    college: 'COEP Pune',
    qualification: 'B.Tech CSE (Final Year)',
    appliedDate: '2026-07-30',
    status: 'Pending',
    resumeFileName: 'Pratham_Joshi_MERN_Resume.pdf',
    resumeUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    statement: 'Extremely passionate about full-stack web development and eager to build scalable microservices.'
  },
  {
    id: 'app-502',
    applicantName: 'Meera Deshmukh',
    email: 'meera.d@outlook.com',
    phone: '+91 97300 88990',
    domain: 'Artificial Intelligence & Deep Learning',
    college: 'VJTI Mumbai',
    qualification: 'B.E. IT (Pre-Final Year)',
    appliedDate: '2026-07-29',
    status: 'Accepted',
    resumeFileName: 'Meera_Deshmukh_AI_CV.pdf',
    resumeUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    statement: 'Interested in Computer Vision models and fine-tuning Open-Source LLMs for enterprise applications.'
  },
  {
    id: 'app-503',
    applicantName: 'Aditya Bhosale',
    email: 'aditya.b@yahoo.com',
    phone: '+91 95521 33441',
    domain: 'DevOps & Cloud Computing (AWS/Docker)',
    college: 'MIT WPU Pune',
    qualification: 'B.Tech E&TC',
    appliedDate: '2026-07-28',
    status: 'Rejected',
    resumeFileName: 'Aditya_Bhosale_Cloud_Resume.pdf',
    resumeUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    statement: 'Looking forward to hands-on AWS infrastructure management and CI/CD pipelines.'
  },
  {
    id: 'app-504',
    applicantName: 'Tanvi Shinde',
    email: 'tanvi.shinde@gmail.com',
    phone: '+91 94220 11223',
    domain: 'UI/UX Design & Product Strategy',
    college: 'Symbiosis Pune',
    qualification: 'B.Des User Experience',
    appliedDate: '2026-07-31',
    status: 'Pending',
    resumeFileName: 'Tanvi_Shinde_Portfolio_CV.pdf',
    resumeUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    statement: 'Eager to design sleek design systems and user journey flows for Websums enterprise client apps.'
  }
];

export const INITIAL_MENTORS: Mentor[] = [
  {
    id: 'mnt-1',
    name: 'Dr. Rajesh Verma',
    email: 'rajesh.verma@websums.com',
    phone: '+91 98000 11122',
    assignedDomains: ['MERN Stack Development', 'Full Stack Java Development'],
    activeBatches: ['Batch W-2026-A', 'Batch W-2026-D'],
    totalStudents: 145,
    rating: 4.9,
    joinedDate: '2025-01-15',
    status: 'Active'
  },
  {
    id: 'mnt-2',
    name: 'Prof. Ankit Mehta',
    email: 'ankit.mehta@websums.com',
    phone: '+91 98000 33344',
    assignedDomains: ['Artificial Intelligence & Deep Learning', 'Machine Learning'],
    activeBatches: ['Batch W-2026-B'],
    totalStudents: 110,
    rating: 4.8,
    joinedDate: '2025-03-01',
    status: 'Active'
  },
  {
    id: 'mnt-3',
    name: 'Priya Sundaram',
    email: 'priya.sundaram@websums.com',
    phone: '+91 98000 55566',
    assignedDomains: ['DevOps & Cloud Computing (AWS/Docker)', 'Cyber Security & Ethical Hacking'],
    activeBatches: ['Batch W-2026-A', 'Batch W-2026-C'],
    totalStudents: 95,
    rating: 4.95,
    joinedDate: '2025-02-10',
    status: 'Active'
  }
];

export const INITIAL_LIVE_CLASSES: LiveClass[] = [
  {
    id: 'lc-1',
    title: 'Enterprise MERN Architecture & Redux Toolkit state sync',
    domain: 'MERN Stack Development',
    batch: 'Batch W-2026-A',
    mentorName: 'Dr. Rajesh Verma',
    date: '2026-07-28',
    time: '18:00 IST',
    durationMinutes: 90,
    meetingPlatform: 'Zoom',
    meetingUrl: 'https://zoom.us/j/9876543210',
    status: 'Upcoming'
  },
  {
    id: 'lc-2',
    title: 'Transformer Models & Attention Mechanism in PyTorch',
    domain: 'Artificial Intelligence & Deep Learning',
    batch: 'Batch W-2026-B',
    mentorName: 'Prof. Ankit Mehta',
    date: '2026-07-28',
    time: '20:00 IST',
    durationMinutes: 90,
    meetingPlatform: 'Google Meet',
    meetingUrl: 'https://meet.google.com/abc-defg-hij',
    status: 'Upcoming'
  },
  {
    id: 'lc-3',
    title: 'Dockerizing Microservices & Container Networking',
    domain: 'DevOps & Cloud Computing (AWS/Docker)',
    batch: 'Batch W-2026-A',
    mentorName: 'Priya Sundaram',
    date: '2026-07-27',
    time: '17:00 IST',
    durationMinutes: 60,
    meetingPlatform: 'Microsoft Teams',
    meetingUrl: 'https://teams.microsoft.com/l/meetup-join/12345',
    status: 'Live'
  }
];

export const INITIAL_LECTURES: RecordedLecture[] = [
  {
    id: 'rec-1',
    title: 'Week 4: Building Secure JWT Authentication & Refresh Tokens',
    domain: 'MERN Stack Development',
    week: 4,
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80',
    duration: '1h 24m',
    viewsCount: 342,
    pdfNotesUrl: '#'
  },
  {
    id: 'rec-2',
    title: 'Week 3: CNN Convolutional Layers & Image Augmentation',
    domain: 'Artificial Intelligence & Deep Learning',
    week: 3,
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
    duration: '1h 45m',
    viewsCount: 289,
    pdfNotesUrl: '#'
  },
  {
    id: 'rec-3',
    title: 'Week 2: Advanced Figma Auto-Layout & Component Variants',
    domain: 'UI/UX Design & Product Strategy',
    week: 2,
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?auto=format&fit=crop&w=600&q=80',
    duration: '1h 10m',
    viewsCount: 410,
    pdfNotesUrl: '#'
  }
];

export const INITIAL_ASSIGNMENTS: Assignment[] = [
  {
    id: 'asg-1',
    title: 'Build RESTful API for E-Commerce Backend with Mongoose',
    domain: 'MERN Stack Development',
    batch: 'Batch W-2026-A',
    dueDate: '2026-08-05',
    maxMarks: 100,
    description: 'Implement User Auth, Product Catalog CRUD, Cart Management, and Order processing with Mongoose schemas and Express validators.',
    totalSubmissions: 42
  },
  {
    id: 'asg-2',
    title: 'Image Classification Model using PyTorch & ResNet50',
    domain: 'Artificial Intelligence & Deep Learning',
    batch: 'Batch W-2026-B',
    dueDate: '2026-08-08',
    maxMarks: 100,
    description: 'Train a convolutional model to classify medical X-ray scans with at least 92% validation accuracy.',
    totalSubmissions: 35
  }
];

export const INITIAL_CERTIFICATES: Certificate[] = [
  {
    id: 'cert-1',
    certificateCode: 'WEBSUM-2026-8891',
    studentName: 'Aarav Sharma',
    studentEmail: 'aarav.sharma@example.com',
    domain: 'MERN Stack Development',
    issueDate: '2026-07-15',
    grade: 'A+ (Distinction)',
    qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=WEBSUM-2026-8891',
    verified: true
  },
  {
    id: 'cert-2',
    certificateCode: 'WEBSUM-2026-9042',
    studentName: 'Sneha Patel',
    studentEmail: 'sneha.patel@example.com',
    domain: 'UI/UX Design & Product Strategy',
    issueDate: '2026-07-20',
    grade: 'A+ (Distinction)',
    qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=WEBSUM-2026-9042',
    verified: true
  }
];

export const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'anc-1',
    title: '🎉 National Hackathon 2026 Registration Open for All Interns!',
    content: 'Websums Software Pvt. Ltd. presents the Annual National Innovation Hackathon with total cash prizes of ₹5,00,000 and direct PPO placement offers from Google, Microsoft & Websums.',
    targetRole: 'All',
    authorName: 'Subhasis Roy (CEO)',
    createdAt: '2026-07-26',
    urgent: true
  },
  {
    id: 'anc-2',
    title: '📢 Mid-Term Evaluation & Live Project Submission Guidelines',
    content: 'All batch W-2026-A students must submit their mid-term project repositories by August 5th via the student assignment portal.',
    targetRole: 'Student',
    authorName: 'Dr. Rajesh Verma',
    createdAt: '2026-07-24',
    urgent: false
  }
];

export const INITIAL_JOBS: JobPosting[] = [
  {
    id: 'job-1',
    companyName: 'Websums Software Pvt. Ltd.',
    roleTitle: 'Junior Software Engineer (Full Stack MERN)',
    location: 'Bangalore / Remote',
    salaryPackage: '₹8.5 LPA - ₹12 LPA',
    type: 'PPO',
    skillsRequired: ['React 19', 'Node.js', 'MongoDB', 'TypeScript', 'Tailwind'],
    appliedCount: 128
  },
  {
    id: 'job-2',
    companyName: 'Microsoft India',
    roleTitle: 'Associate Cloud DevOps Engineer',
    location: 'Hyderabad',
    salaryPackage: '₹14 LPA - ₹18 LPA',
    type: 'Full-time',
    skillsRequired: ['AWS/Azure', 'Docker', 'Kubernetes', 'CI/CD', 'Linux'],
    appliedCount: 240
  },
  {
    id: 'job-3',
    companyName: 'Google Cloud Labs',
    roleTitle: 'AI Research & Engineering Intern',
    location: 'Gurgaon / Remote',
    salaryPackage: '₹45,000 / month',
    type: 'Internship',
    skillsRequired: ['Python', 'PyTorch', 'Computer Vision', 'LLMs'],
    appliedCount: 310
  }
];

export const INITIAL_QUIZZES: Quiz[] = [
  {
    id: 'qz-101',
    title: 'MERN Stack & React 19 Core Concepts',
    domain: 'MERN Stack Development',
    category: 'React',
    difficulty: 'Intermediate',
    durationMinutes: 15,
    totalQuestions: 4,
    totalMarks: 100,
    xpReward: 10,
    status: 'In Progress',
    questionsAnswered: 2,
    progressPercent: 50,
    questions: [
      {
        id: 'q1',
        question: 'Which Hook in React 19 is primarily used for asynchronous data fetching directly in server components or with suspense?',
        options: ['useAsync', 'use', 'useFetch', 'useEffectServer'],
        correctAnswer: 1,
        explanation: 'React 19 introduced the `use` API to read values of promises or contexts directly during render.'
      },
      {
        id: 'q2',
        question: 'In MongoDB Mongoose, which method is used to populate reference documents across collections?',
        options: ['join()', 'aggregate()', 'populate()', 'lookup()'],
        correctAnswer: 2,
        explanation: '`populate()` lets you reference documents in other collections using ObjectIds.'
      },
      {
        id: 'q3',
        question: 'What status code should an Express REST API return upon successful creation of a new resource (e.g. POST /api/students)?',
        options: ['200 OK', '201 Created', '204 No Content', '302 Found'],
        correctAnswer: 1,
        explanation: 'HTTP Status 201 Created signifies that the request succeeded and led to creation of a resource.'
      },
      {
        id: 'q4',
        question: 'What is the purpose of JWT Refresh Tokens in Enterprise Authentication?',
        options: [
          'To encrypt user passwords in database',
          'To obtain a new short-lived Access Token without re-authenticating user credentials',
          'To compress HTTP header payload size',
          'To block CORS cross-origin requests'
        ],
        correctAnswer: 1,
        explanation: 'Refresh tokens allow seamless token renewal without forcing the user to log in again.'
      }
    ]
  },
  {
    id: 'qz-102',
    title: 'JavaScript Fundamentals & ES6+ Mastery',
    domain: 'MERN Stack Development',
    category: 'JavaScript',
    difficulty: 'Beginner',
    durationMinutes: 12,
    totalQuestions: 4,
    totalMarks: 100,
    xpReward: 10,
    status: 'Completed',
    questionsAnswered: 4,
    progressPercent: 100,
    bestScore: 90,
    questions: [
      {
        id: 'js-q1',
        question: 'What will `typeof NaN` evaluate to in JavaScript?',
        options: ['number', 'nan', 'undefined', 'object'],
        correctAnswer: 0,
        explanation: 'In JavaScript, NaN (Not-a-Number) is technically considered a number type.'
      },
      {
        id: 'js-q2',
        question: 'Which ES6 feature allows unpacking values from arrays or properties from objects?',
        options: ['Spread operator', 'Destructuring assignment', 'Rest parameters', 'Template literals'],
        correctAnswer: 1,
        explanation: 'Destructuring assignment allows extracting properties from objects into variables.'
      },
      {
        id: 'js-q3',
        question: 'What is the key difference between `let` and `var` declaration in JavaScript?',
        options: ['let is block-scoped, var is function-scoped', 'var cannot be re-assigned', 'let is hoisted to global window object', 'There is no difference'],
        correctAnswer: 0,
        explanation: '`let` and `const` create block-scoped variables, whereas `var` is function-scoped.'
      },
      {
        id: 'js-q4',
        question: 'How do you create a resolved Promise in JavaScript?',
        options: ['Promise.fulfill()', 'Promise.resolve(data)', 'new Promise().complete()', 'Promise.done()'],
        correctAnswer: 1,
        explanation: '`Promise.resolve(value)` returns a Promise object that is resolved with the given value.'
      }
    ]
  },
  {
    id: 'qz-103',
    title: 'Node.js, Express REST APIs & Auth',
    domain: 'MERN Stack Development',
    category: 'Node.js & Express',
    difficulty: 'Intermediate',
    durationMinutes: 15,
    totalQuestions: 3,
    totalMarks: 100,
    xpReward: 15,
    status: 'Not Started',
    progressPercent: 0,
    questionsAnswered: 0,
    questions: [
      {
        id: 'nd-1',
        question: 'Which built-in Node.js module handles file system operations like reading or writing files?',
        options: ['path', 'fs', 'http', 'os'],
        correctAnswer: 1,
        explanation: 'The `fs` (File System) module allows interacting with the file system.'
      },
      {
        id: 'nd-2',
        question: 'What is Express Middleware in Node.js backend development?',
        options: ['A database ORM', 'Functions that access the request object (req), response object (res), and next middleware', 'A frontend template compiler', 'A deployment server tool'],
        correctAnswer: 1,
        explanation: 'Middleware functions execute during the request-response cycle and call next() to pass control.'
      },
      {
        id: 'nd-3',
        question: 'Which HTTP method should be used to partially update an existing entity?',
        options: ['PUT', 'PATCH', 'POST', 'DELETE'],
        correctAnswer: 1,
        explanation: 'HTTP PATCH is used for partial modifications, while PUT usually replaces the entire resource.'
      }
    ]
  },
  {
    id: 'qz-104',
    title: 'MongoDB Schema & Aggregation Pipeline',
    domain: 'MERN Stack Development',
    category: 'MongoDB',
    difficulty: 'Advanced',
    durationMinutes: 20,
    totalQuestions: 3,
    totalMarks: 100,
    xpReward: 20,
    status: 'Locked',
    prerequisiteTitle: 'MERN Stack & React 19 Core Concepts',
    progressPercent: 0,
    questionsAnswered: 0,
    questions: [
      {
        id: 'mg-1',
        question: 'Which aggregation pipeline stage is used to filter documents in MongoDB?',
        options: ['$match', '$group', '$project', '$lookup'],
        correctAnswer: 0,
        explanation: '`$match` filters documents to pass only specified documents to the next stage.'
      },
      {
        id: 'mg-2',
        question: 'In Mongoose schemas, what option ensures that a field value is unique across all documents?',
        options: ['unique: true', 'primaryKey: true', 'indexOnly: true', 'distinct: true'],
        correctAnswer: 0,
        explanation: 'Setting `unique: true` creates a unique index in MongoDB.'
      },
      {
        id: 'mg-3',
        question: 'Which stage performs an left outer join to an unsharded collection in the same database?',
        options: ['$join', '$lookup', '$foreignKey', '$merge'],
        correctAnswer: 1,
        explanation: '`$lookup` performs a left outer join to fetch related documents from another collection.'
      }
    ]
  },
  {
    id: 'qz-201',
    title: 'Python for AI & PyTorch Neural Networks',
    domain: 'AI & Machine Learning',
    category: 'PyTorch & Neural Networks',
    difficulty: 'Intermediate',
    durationMinutes: 15,
    totalQuestions: 3,
    totalMarks: 100,
    xpReward: 15,
    status: 'Not Started',
    questionsAnswered: 0,
    progressPercent: 0,
    questions: [
      {
        id: 'ai-1',
        question: 'In PyTorch, which method computes the gradient of current tensor w.r.t. graph leaves?',
        options: ['tensor.backward()', 'tensor.grad()', 'torch.step()', 'tensor.evaluate()'],
        correctAnswer: 0,
        explanation: 'Calling `backward()` computes the gradients automatically via autograd.'
      },
      {
        id: 'ai-2',
        question: 'Which activation function is most commonly used in hidden layers of Deep Neural Networks to mitigate vanishing gradients?',
        options: ['Sigmoid', 'Tanh', 'ReLU (Rectified Linear Unit)', 'Linear'],
        correctAnswer: 2,
        explanation: 'ReLU helps prevent vanishing gradients for positive inputs during backpropagation.'
      },
      {
        id: 'ai-3',
        question: 'What is the purpose of DataLoader in PyTorch?',
        options: ['To compile Python code to CUDA', 'To provide an iterable over a dataset with batching, shuffling, and multi-processing', 'To convert model weights to ONNX', 'To clear GPU memory'],
        correctAnswer: 1,
        explanation: 'PyTorch DataLoader manages data batching, shuffling, and parallel loading.'
      }
    ]
  },
  {
    id: 'qz-301',
    title: 'Pandas & Exploratory Data Analysis',
    domain: 'Data Science',
    category: 'Data Analysis',
    difficulty: 'Beginner',
    durationMinutes: 15,
    totalQuestions: 3,
    totalMarks: 100,
    xpReward: 10,
    status: 'Not Started',
    questionsAnswered: 0,
    progressPercent: 0,
    questions: [
      {
        id: 'ds-1',
        question: 'In Pandas, which method returns summary statistics for numerical columns in a DataFrame?',
        options: ['df.info()', 'df.describe()', 'df.summary()', 'df.head()'],
        correctAnswer: 1,
        explanation: '`df.describe()` calculates mean, std, min, max, and quartiles.'
      },
      {
        id: 'ds-2',
        question: 'Which function reads a comma-separated values (CSV) file into a Pandas DataFrame?',
        options: ['pd.read_csv()', 'pd.load_csv()', 'pd.open_csv()', 'pd.import_csv()'],
        correctAnswer: 0,
        explanation: '`pd.read_csv("file.csv")` imports CSV files into DataFrames.'
      },
      {
        id: 'ds-3',
        question: 'How do you handle missing (NaN) values by dropping rows in Pandas?',
        options: ['df.drop_null()', 'df.dropna()', 'df.remove_nan()', 'df.clean()'],
        correctAnswer: 1,
        explanation: '`df.dropna()` removes rows containing missing values.'
      }
    ]
  }
];

export const SAMPLE_QUIZ: Quiz = INITIAL_QUIZZES[0];

export const ANALYTICS_GRAPH_DATA = [
  { month: 'Jan', enrollment: 320, revenue: 12.5, attendance: 92 },
  { month: 'Feb', enrollment: 450, revenue: 18.0, attendance: 94 },
  { month: 'Mar', enrollment: 590, revenue: 24.2, attendance: 91 },
  { month: 'Apr', enrollment: 780, revenue: 31.0, attendance: 95 },
  { month: 'May', enrollment: 950, revenue: 38.4, attendance: 93 },
  { month: 'Jun', enrollment: 1120, revenue: 45.0, attendance: 96 },
  { month: 'Jul', enrollment: 1248, revenue: 52.8, attendance: 94 }
];
