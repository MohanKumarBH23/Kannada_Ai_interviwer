"""
Curated interview Q&A training data used to prime Gemini prompts.
Each entry has: role, difficulty, category, question, ideal_answer_hints.
"""

TRAINING_DATA = [
    # ── SOFTWARE ENGINEER ──────────────────────────────────────────────────
    {
        "role": "Software Engineer",
        "difficulty": "easy",
        "category": "DSA",
        "question": "What is the time complexity of binary search?",
        "ideal_answer_hints": [
            "O(log n) time complexity",
            "Works on sorted arrays",
            "Halves the search space each iteration",
        ],
    },
    {
        "role": "Software Engineer",
        "difficulty": "easy",
        "category": "Technical",
        "question": "What is the difference between a stack and a queue?",
        "ideal_answer_hints": [
            "Stack is LIFO (Last In First Out)",
            "Queue is FIFO (First In First Out)",
            "Stack uses push/pop, Queue uses enqueue/dequeue",
        ],
    },
    {
        "role": "Software Engineer",
        "difficulty": "medium",
        "category": "DSA",
        "question": "Explain how a HashMap works internally.",
        "ideal_answer_hints": [
            "Uses hash function to compute bucket index",
            "Handles collisions via chaining or open addressing",
            "Average O(1) for get/put, O(n) worst case",
            "Load factor triggers rehashing",
        ],
    },
    {
        "role": "Software Engineer",
        "difficulty": "medium",
        "category": "System Design",
        "question": "How would you design a URL shortener like bit.ly?",
        "ideal_answer_hints": [
            "Base62 encoding to generate short keys",
            "Database mapping short key -> original URL",
            "Cache hot URLs with Redis/Memcached",
            "Handle redirects with HTTP 301/302",
            "Consider expiry and analytics",
        ],
    },
    {
        "role": "Software Engineer",
        "difficulty": "hard",
        "category": "System Design",
        "question": "Design a distributed rate limiter.",
        "ideal_answer_hints": [
            "Token bucket or sliding window algorithm",
            "Use Redis for distributed counters with TTL",
            "Lua scripts for atomic increment + check",
            "Handle clock skew across nodes",
            "Return 429 Too Many Requests on breach",
        ],
    },
    {
        "role": "Software Engineer",
        "difficulty": "hard",
        "category": "DSA",
        "question": "How does Dijkstra's algorithm work and when does it fail?",
        "ideal_answer_hints": [
            "Greedy shortest-path on weighted graphs",
            "Uses a min-heap priority queue",
            "O((V + E) log V) with binary heap",
            "Fails with negative weight edges — use Bellman-Ford instead",
        ],
    },
    {
        "role": "Software Engineer",
        "difficulty": "medium",
        "category": "Behavioral",
        "question": "Tell me about a time you debugged a very difficult bug.",
        "ideal_answer_hints": [
            "Use STAR format: Situation, Task, Action, Result",
            "Describe systematic isolation of the problem",
            "Mention tools used (debugger, logs, profiler)",
            "Quantify the impact of the fix",
        ],
    },
    # ── FRONTEND DEVELOPER ─────────────────────────────────────────────────
    {
        "role": "Frontend Developer",
        "difficulty": "easy",
        "category": "Technical",
        "question": "What is the difference between `let`, `const`, and `var` in JavaScript?",
        "ideal_answer_hints": [
            "var is function-scoped and hoisted",
            "let is block-scoped, not hoisted to usable state",
            "const is block-scoped and cannot be reassigned",
            "Prefer const > let > var",
        ],
    },
    {
        "role": "Frontend Developer",
        "difficulty": "medium",
        "category": "Technical",
        "question": "Explain the React reconciliation algorithm.",
        "ideal_answer_hints": [
            "Virtual DOM diffing compares old and new trees",
            "Same type components update in place",
            "Different types unmount and remount",
            "Keys help React identify list items efficiently",
            "Fiber architecture enables incremental rendering",
        ],
    },
    {
        "role": "Frontend Developer",
        "difficulty": "medium",
        "category": "Technical",
        "question": "What are React hooks and why were they introduced?",
        "ideal_answer_hints": [
            "Allow state and lifecycle in functional components",
            "Replace class components for cleaner code",
            "Common hooks: useState, useEffect, useContext, useRef",
            "Rules: only call at top level, only in React functions",
        ],
    },
    {
        "role": "Frontend Developer",
        "difficulty": "hard",
        "category": "Technical",
        "question": "How would you optimise a React app that renders 10,000 list items?",
        "ideal_answer_hints": [
            "Virtual list / windowing with react-window or react-virtualized",
            "Memoize components with React.memo",
            "useMemo and useCallback to avoid re-renders",
            "Pagination or infinite scroll instead of full list",
            "Web Workers for heavy computation off main thread",
        ],
    },
    {
        "role": "Frontend Developer",
        "difficulty": "easy",
        "category": "Technical",
        "question": "What is CSS specificity and how is it calculated?",
        "ideal_answer_hints": [
            "Inline styles (1000) > ID (100) > class/attr/pseudo-class (10) > element (1)",
            "Higher specificity wins regardless of order",
            "!important overrides all specificity",
        ],
    },
    {
        "role": "Frontend Developer",
        "difficulty": "medium",
        "category": "System Design",
        "question": "How do you handle state management in a large React application?",
        "ideal_answer_hints": [
            "Context API for simple global state",
            "Redux Toolkit for complex, predictable state",
            "Zustand or Jotai for lightweight alternatives",
            "React Query / SWR for server state",
            "Keep local state local, lift only when necessary",
        ],
    },
    # ── BACKEND DEVELOPER ──────────────────────────────────────────────────
    {
        "role": "Backend Developer",
        "difficulty": "easy",
        "category": "Technical",
        "question": "What is REST and what are its core principles?",
        "ideal_answer_hints": [
            "Representational State Transfer",
            "Stateless client-server communication",
            "Uniform interface (HTTP methods GET/POST/PUT/DELETE)",
            "Resource-based URLs",
            "Cacheable responses",
        ],
    },
    {
        "role": "Backend Developer",
        "difficulty": "medium",
        "category": "Technical",
        "question": "What is database indexing and when should you avoid it?",
        "ideal_answer_hints": [
            "Speeds up SELECT queries by creating lookup structures",
            "B-tree index for range queries, Hash index for equality",
            "Avoid on frequently updated columns (write overhead)",
            "Avoid on small tables (full scan may be faster)",
            "Composite indexes: column order matters",
        ],
    },
    {
        "role": "Backend Developer",
        "difficulty": "hard",
        "category": "System Design",
        "question": "Explain the CAP theorem with a real-world example.",
        "ideal_answer_hints": [
            "Consistency, Availability, Partition tolerance — pick 2",
            "Network partitions are unavoidable in distributed systems",
            "CP example: HBase, ZooKeeper",
            "AP example: Cassandra, CouchDB",
            "CA is possible only without partitions (single node)",
        ],
    },
    {
        "role": "Backend Developer",
        "difficulty": "medium",
        "category": "Technical",
        "question": "How does JWT authentication work?",
        "ideal_answer_hints": [
            "Header.Payload.Signature format",
            "Server signs token with secret or private key",
            "Client sends token in Authorization header",
            "Server verifies signature — no DB lookup needed",
            "Access tokens short-lived; refresh tokens long-lived",
        ],
    },
    {
        "role": "Backend Developer",
        "difficulty": "hard",
        "category": "System Design",
        "question": "How would you design a message queue system from scratch?",
        "ideal_answer_hints": [
            "Producer publishes messages to topics/queues",
            "Broker stores messages durably (WAL on disk)",
            "Consumers pull or get pushed messages",
            "Acknowledgement prevents message loss",
            "Dead-letter queue for failed messages",
            "Kafka for high-throughput; RabbitMQ for routing flexibility",
        ],
    },
    # ── DATA SCIENTIST ─────────────────────────────────────────────────────
    {
        "role": "Data Scientist",
        "difficulty": "easy",
        "category": "Technical",
        "question": "What is the difference between supervised and unsupervised learning?",
        "ideal_answer_hints": [
            "Supervised: labeled data, learns mapping input->output",
            "Unsupervised: no labels, finds hidden patterns/clusters",
            "Examples: Linear Regression (supervised), K-Means (unsupervised)",
        ],
    },
    {
        "role": "Data Scientist",
        "difficulty": "medium",
        "category": "Technical",
        "question": "Explain overfitting and how to prevent it.",
        "ideal_answer_hints": [
            "Model performs well on train but poorly on test",
            "Prevention: regularization (L1/L2), dropout, early stopping",
            "More training data, cross-validation",
            "Reduce model complexity",
        ],
    },
    {
        "role": "Data Scientist",
        "difficulty": "hard",
        "category": "Technical",
        "question": "How does gradient boosting differ from random forests?",
        "ideal_answer_hints": [
            "Random Forest: parallel ensemble of trees, reduces variance",
            "Gradient Boosting: sequential, each tree corrects previous errors",
            "GB minimizes loss via gradient descent in function space",
            "XGBoost adds regularization and second-order gradients",
            "RF more robust to hyperparameters; GB often higher accuracy",
        ],
    },
    {
        "role": "Data Scientist",
        "difficulty": "medium",
        "category": "Technical",
        "question": "What metrics would you use to evaluate a binary classification model?",
        "ideal_answer_hints": [
            "Accuracy (misleading for imbalanced classes)",
            "Precision, Recall, F1-score",
            "ROC-AUC — threshold-independent measure",
            "Confusion matrix for detailed breakdown",
            "Log loss for probabilistic outputs",
        ],
    },
    {
        "role": "Data Scientist",
        "difficulty": "hard",
        "category": "Technical",
        "question": "Explain how attention mechanism works in transformers.",
        "ideal_answer_hints": [
            "Q, K, V matrices derived from input embeddings",
            "Attention score = softmax(QK^T / sqrt(d_k)) * V",
            "Multi-head attention learns different relationships in parallel",
            "Self-attention allows each token to attend to all others",
            "Positional encoding adds sequence order information",
        ],
    },
    # ── ML ENGINEER ────────────────────────────────────────────────────────
    {
        "role": "ML Engineer",
        "difficulty": "medium",
        "category": "Technical",
        "question": "What is MLOps and why is it important?",
        "ideal_answer_hints": [
            "Practices to deploy and maintain ML models in production",
            "Covers CI/CD for models, data pipelines, monitoring",
            "Addresses model drift, data quality, retraining",
            "Tools: MLflow, Kubeflow, SageMaker",
        ],
    },
    {
        "role": "ML Engineer",
        "difficulty": "hard",
        "category": "Technical",
        "question": "How do you detect and handle model drift in production?",
        "ideal_answer_hints": [
            "Data drift: input distribution shifts over time",
            "Concept drift: relationship between X and Y changes",
            "Monitor statistical metrics (KL divergence, PSI) on input features",
            "Track model performance metrics (accuracy, AUC) over time",
            "Set up automated retraining pipelines triggered by drift thresholds",
        ],
    },
    {
        "role": "ML Engineer",
        "difficulty": "medium",
        "category": "System Design",
        "question": "Design an end-to-end ML pipeline for a recommendation system.",
        "ideal_answer_hints": [
            "Data ingestion: user interactions, item metadata",
            "Feature engineering: embeddings, collaborative filtering signals",
            "Training: matrix factorization or neural collaborative filtering",
            "Serving: low-latency API with pre-computed embeddings",
            "A/B testing for model comparison",
            "Feedback loop to retrain on new interaction data",
        ],
    },
    # ── DEVOPS ENGINEER ────────────────────────────────────────────────────
    {
        "role": "DevOps Engineer",
        "difficulty": "easy",
        "category": "Technical",
        "question": "What is Docker and how does it differ from a virtual machine?",
        "ideal_answer_hints": [
            "Containers share host OS kernel; VMs have full guest OS",
            "Containers are lighter and start faster than VMs",
            "Docker packages app + dependencies into portable image",
            "VMs provide stronger isolation via hypervisor",
        ],
    },
    {
        "role": "DevOps Engineer",
        "difficulty": "medium",
        "category": "Technical",
        "question": "Explain the Kubernetes deployment lifecycle.",
        "ideal_answer_hints": [
            "kubectl apply creates/updates Deployment resource",
            "Deployment controller creates/manages ReplicaSets",
            "ReplicaSet ensures desired pod count",
            "Rolling update strategy avoids downtime",
            "Readiness probes gate traffic to healthy pods",
        ],
    },
    {
        "role": "DevOps Engineer",
        "difficulty": "hard",
        "category": "System Design",
        "question": "How would you implement a zero-downtime deployment pipeline?",
        "ideal_answer_hints": [
            "Blue-green deployment: switch traffic between two identical environments",
            "Canary release: gradually shift traffic to new version",
            "Feature flags to decouple deployment from release",
            "Automated smoke tests before full rollout",
            "Instant rollback capability if health checks fail",
        ],
    },
    {
        "role": "DevOps Engineer",
        "difficulty": "medium",
        "category": "Technical",
        "question": "What is Infrastructure as Code and which tools support it?",
        "ideal_answer_hints": [
            "Define infrastructure in version-controlled config files",
            "Terraform (cloud-agnostic), CloudFormation (AWS), Pulumi",
            "Enables reproducible, auditable, collaborative infra management",
            "Drift detection when actual state diverges from code",
        ],
    },
    # ── PRODUCT MANAGER ────────────────────────────────────────────────────
    {
        "role": "Product Manager",
        "difficulty": "easy",
        "category": "Behavioral",
        "question": "How do you prioritize features on a product roadmap?",
        "ideal_answer_hints": [
            "RICE framework: Reach, Impact, Confidence, Effort",
            "MoSCoW: Must have, Should have, Could have, Won't have",
            "Align with business goals and OKRs",
            "Gather data: user research, analytics, stakeholder input",
            "Consider dependencies and technical feasibility",
        ],
    },
    {
        "role": "Product Manager",
        "difficulty": "medium",
        "category": "Behavioral",
        "question": "Describe how you would define success metrics for a new feature.",
        "ideal_answer_hints": [
            "Define primary metric tied to feature goal",
            "Set guardrail metrics to detect regressions",
            "Use AARRR funnel: Acquisition, Activation, Retention, Referral, Revenue",
            "Baseline current metrics before launch",
            "Define success threshold before starting A/B test",
        ],
    },
    {
        "role": "Product Manager",
        "difficulty": "hard",
        "category": "Behavioral",
        "question": "How would you launch a product in a new market where you have no data?",
        "ideal_answer_hints": [
            "Start with qualitative research: user interviews, ethnographic study",
            "Identify analogous markets for proxy data",
            "Run small experiments with local partners",
            "Build MVP to validate core assumptions cheaply",
            "Define learning goals before each experiment",
        ],
    },
    # ── HR / BEHAVIORAL ────────────────────────────────────────────────────
    {
        "role": "HR",
        "difficulty": "easy",
        "category": "HR",
        "question": "Why do you want to work at this company?",
        "ideal_answer_hints": [
            "Research company values, culture, and recent news",
            "Align personal goals with company mission",
            "Be specific — mention a product, initiative, or team",
            "Show genuine enthusiasm, not just job-seeking",
        ],
    },
    {
        "role": "HR",
        "difficulty": "medium",
        "category": "Behavioral",
        "question": "Tell me about a conflict you had with a colleague and how you resolved it.",
        "ideal_answer_hints": [
            "Use STAR format",
            "Show empathy and active listening",
            "Focus on resolution and learnings, not blame",
            "Demonstrate professionalism and communication skills",
        ],
    },
    {
        "role": "HR",
        "difficulty": "easy",
        "category": "HR",
        "question": "Where do you see yourself in 5 years?",
        "ideal_answer_hints": [
            "Align growth goals with the role's career path",
            "Show ambition balanced with realism",
            "Mention skills you want to develop",
            "Tie answer back to company's growth opportunities",
        ],
    },
    # ── SYSTEM DESIGN SPECIALIST ───────────────────────────────────────────
    {
        "role": "System Design",
        "difficulty": "hard",
        "category": "System Design",
        "question": "Design Twitter's home timeline feature.",
        "ideal_answer_hints": [
            "Fan-out on write: push tweets to follower timelines at write time",
            "Fan-out on read: pull and merge feeds at read time for celebrity accounts",
            "Hybrid approach for mixed follower counts",
            "Use Redis sorted sets for timeline storage",
            "CDN for media, separate media service",
        ],
    },
    {
        "role": "System Design",
        "difficulty": "hard",
        "category": "System Design",
        "question": "How would you design a distributed file storage system like Google Drive?",
        "ideal_answer_hints": [
            "Chunk files into 64MB blocks, store chunks across servers",
            "Metadata service tracks chunk locations",
            "Replication factor 3 for durability",
            "Consistent hashing for chunk server selection",
            "Delta sync: only upload changed chunks",
            "Use object store (S3-compatible) for raw chunks",
        ],
    },
    {
        "role": "System Design",
        "difficulty": "medium",
        "category": "System Design",
        "question": "Design a notification service that handles millions of users.",
        "ideal_answer_hints": [
            "Decouple notification creation from delivery via message queue",
            "Workers per channel: email (SES), SMS (Twilio), push (FCM/APNs)",
            "Rate limiting per user to avoid spam",
            "Retry with exponential backoff for failures",
            "Store notification history in DB for inbox view",
        ],
    },
    # ── FULL STACK DEVELOPER ───────────────────────────────────────────────
    {
        "role": "Full Stack Developer",
        "difficulty": "medium",
        "category": "Technical",
        "question": "Explain the event loop in Node.js.",
        "ideal_answer_hints": [
            "Single-threaded, non-blocking I/O via libuv",
            "Call stack, event queue, and microtask queue",
            "Promises/async-await use microtask queue (higher priority)",
            "setImmediate vs setTimeout execution order",
            "Heavy CPU tasks block the loop — offload to worker threads",
        ],
    },
    {
        "role": "Full Stack Developer",
        "difficulty": "hard",
        "category": "Technical",
        "question": "How do you implement authentication and authorisation securely in a full-stack app?",
        "ideal_answer_hints": [
            "Use HTTPS everywhere",
            "Hash passwords with bcrypt (cost factor >= 12)",
            "JWT for stateless auth; store in httpOnly cookie",
            "RBAC for authorisation — check role on every protected route",
            "CSRF protection for cookie-based auth",
            "Rate-limit login endpoints to prevent brute force",
        ],
    },
    {
        "role": "Full Stack Developer",
        "difficulty": "medium",
        "category": "Technical",
        "question": "What is the difference between SQL and NoSQL databases?",
        "ideal_answer_hints": [
            "SQL: relational, fixed schema, ACID transactions",
            "NoSQL: flexible schema, horizontal scaling, eventual consistency",
            "SQL best for complex queries and relationships",
            "NoSQL best for high write throughput and unstructured data",
            "Examples: PostgreSQL (SQL), MongoDB, Cassandra (NoSQL)",
        ],
    },
    # ── QA ENGINEER ────────────────────────────────────────────────────────
    {
        "role": "QA Engineer",
        "difficulty": "easy",
        "category": "Technical",
        "question": "What is the difference between functional and non-functional testing?",
        "ideal_answer_hints": [
            "Functional: tests what the system does (features, logic)",
            "Non-functional: tests how the system performs (performance, security, usability)",
            "Examples: unit testing (functional), load testing (non-functional)",
        ],
    },
    {
        "role": "QA Engineer",
        "difficulty": "medium",
        "category": "Technical",
        "question": "How would you write a test plan for a login feature?",
        "ideal_answer_hints": [
            "Happy path: valid credentials succeed",
            "Negative cases: wrong password, empty fields, SQL injection",
            "Edge cases: max length passwords, special characters",
            "Security: brute force protection, account lockout",
            "Cross-browser and mobile testing",
        ],
    },
    {
        "role": "QA Engineer",
        "difficulty": "hard",
        "category": "Technical",
        "question": "Design a performance testing strategy for an e-commerce site during a flash sale.",
        "ideal_answer_hints": [
            "Define SLOs: p99 < 2s, 0 errors under 10k concurrent users",
            "Use k6 or JMeter to simulate ramp-up traffic",
            "Identify bottlenecks: DB queries, API rate limits, CDN",
            "Test with production-like data volumes",
            "Monitor APM (Datadog/New Relic) during tests",
            "Test checkout and payment flow specifically",
        ],
    },
]


def get_questions_for_role(role: str, difficulty: str | None = None, limit: int = 3) -> list:
    """Return sample questions for a given role/difficulty, used for few-shot prompting."""
    filtered = [q for q in TRAINING_DATA if q["role"].lower() == role.lower()]
    if difficulty:
        filtered = [q for q in filtered if q["difficulty"].lower() == difficulty.lower()]
    if not filtered:
        # Fallback to any role
        filtered = TRAINING_DATA
    return filtered[:limit]


def get_all_questions() -> list:
    """Return all training questions."""
    return TRAINING_DATA
