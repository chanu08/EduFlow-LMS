/**
 * EduFlow LMS — Database Seed Script
 * Run with:  node seed.js
 *
 * WARNING: This will TRUNCATE users, courses, and lessons tables.
 *          All existing data in those tables will be lost.
 */

require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('./db');

// ─── Seed Data ────────────────────────────────────────────────────────────────

const USERS = [
    {
        username: 'dr_ai_instructor',
        email: 'instructor@eduflow.dev',
        password: 'Teacher@123',
        role: 'teacher',
    },
    {
        username: 'alex_learner',
        email: 'student@eduflow.dev',
        password: 'Student@123',
        role: 'student',
    },
];

const COURSES = [
    {
        title: 'Python for Data Science',
        description:
            'Master Python from the ground up for data science applications. Learn NumPy, Pandas, and Matplotlib to manipulate, analyse, and visualise real-world datasets. Perfect for beginners who want to break into the data science field.',
        thumbnail_url:
            'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=800&q=80',
        lessons: [
            {
                order_number: 1,
                title: 'Introduction to Python & Jupyter Notebooks',
                video_url: 'https://www.youtube.com/embed/rfscVS0vtbw',
                content_text: `Welcome to Python for Data Science!

In this first lesson, we cover the Python ecosystem for data science and set up your local development environment.

**Key concepts:**
- Installing Anaconda / Miniconda
- Launching and navigating Jupyter Notebooks
- Python data types: int, float, str, list, dict, tuple
- Writing your first Python script

**Code example:**
\`\`\`python
# Python basics
name = "EduFlow"
year = 2024
scores = [92, 85, 78, 95]

print(f"Welcome to {name}!")
print(f"Average score: {sum(scores) / len(scores):.1f}")
\`\`\`

By the end of this lesson you will be comfortable navigating Jupyter Notebooks and writing basic Python scripts.`,
            },
            {
                order_number: 2,
                title: 'NumPy — Numerical Computing',
                video_url: 'https://www.youtube.com/embed/QUT1VHiLmmI',
                content_text: `NumPy is the backbone of numerical computing in Python.

**Topics covered:**
- Creating arrays with np.array(), np.zeros(), np.arange()
- Array slicing and indexing
- Broadcasting and vectorised operations
- Statistical functions: mean, median, std, var

**Code example:**
\`\`\`python
import numpy as np

scores = np.array([85, 92, 78, 95, 88])
print(f"Mean:  {np.mean(scores):.1f}")
print(f"Std:   {np.std(scores):.1f}")
print(f"Above 90: {scores[scores > 90]}")
\`\`\`

NumPy operations run up to 100× faster than equivalent pure Python loops — always prefer vectorised operations!`,
            },
            {
                order_number: 3,
                title: 'Pandas — Data Manipulation',
                video_url: 'https://www.youtube.com/embed/vmEHCJofslg',
                content_text: `Pandas gives you powerful DataFrame objects for working with tabular data.

**Topics covered:**
- Creating Series and DataFrames
- Reading CSVs with pd.read_csv()
- Filtering, groupby, and aggregation
- Handling missing values (NaN)

**Code example:**
\`\`\`python
import pandas as pd

df = pd.read_csv("students.csv")
print(df.head())
print(df.describe())

# Filter students above 80
top_students = df[df["score"] > 80]
avg_by_class = df.groupby("class")["score"].mean()
\`\`\`

Real-world data is messy; pandas gives you the tools to clean and explore it efficiently.`,
            },
            {
                order_number: 4,
                title: 'Matplotlib & Seaborn — Data Visualisation',
                video_url: 'https://www.youtube.com/embed/a9UrKTVEeZA',
                content_text: `A picture is worth a thousand rows of data. Learn to tell compelling visual stories.

**Topics covered:**
- Line charts, bar charts, scatter plots with matplotlib
- Beautiful statistical charts with seaborn
- Customising colours, labels, and annotations
- Saving figures as PNG/SVG

**Code example:**
\`\`\`python
import matplotlib.pyplot as plt
import seaborn as sns

sns.set_theme(style="darkgrid")
tips = sns.load_dataset("tips")
sns.scatterplot(data=tips, x="total_bill", y="tip", hue="sex")
plt.title("Tips vs Total Bill")
plt.savefig("chart.png", dpi=150)
plt.show()
\`\`\`

Visualisation is your most powerful tool for communicating findings to non-technical stakeholders.`,
            },
        ],
    },
    {
        title: 'Machine Learning Fundamentals',
        description:
            'Build a solid foundation in machine learning algorithms. Covering supervised and unsupervised learning, model evaluation, and scikit-learn. You will train, evaluate, and tune real ML models on industry-standard datasets by the end of the course.',
        thumbnail_url:
            'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&q=80',
        lessons: [
            {
                order_number: 1,
                title: 'The ML Workflow — From Data to Prediction',
                video_url: 'https://www.youtube.com/embed/i_LwzRVP7bg',
                content_text: `Every machine learning project follows the same high-level workflow.

**The 6-step ML pipeline:**
1. Define the problem and success metric
2. Collect and explore the data (EDA)
3. Preprocess and feature-engineer
4. Choose and train a model
5. Evaluate and tune
6. Deploy and monitor

**Key terminology:**
- **Features (X):** the input variables
- **Label (y):** the output we want to predict
- **Training set / Test set:** splitting data to prevent overfitting
- **Overfitting vs Underfitting:** the bias-variance tradeoff

Understanding this workflow before writing a single line of ML code will save you countless hours of confusion.`,
            },
            {
                order_number: 2,
                title: 'Linear & Logistic Regression',
                video_url: 'https://www.youtube.com/embed/VmbA0pi2cRQ',
                content_text: `The two workhorses of supervised learning.

**Linear Regression** — predicts a continuous value (e.g., house price):
\`\`\`python
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)
model = LinearRegression()
model.fit(X_train, y_train)
print(f"R² score: {model.score(X_test, y_test):.3f}")
\`\`\`

**Logistic Regression** — predicts a class probability (e.g., spam or not):
\`\`\`python
from sklearn.linear_model import LogisticRegression
clf = LogisticRegression(max_iter=1000)
clf.fit(X_train, y_train)
print(classification_report(y_test, clf.predict(X_test)))
\`\`\`

Despite the name, logistic regression is a classification algorithm — one of the most interpretable in existence.`,
            },
            {
                order_number: 3,
                title: 'Decision Trees & Random Forests',
                video_url: 'https://www.youtube.com/embed/J4Wdy0Wc_xQ',
                content_text: `Tree-based models are powerful, interpretable, and require minimal preprocessing.

**Decision Trees:**
- Split data at each node based on the feature that maximises information gain
- Prone to overfitting when grown too deep
- Use max_depth and min_samples_split to regularise

**Random Forests:** an ensemble of de-correlated decision trees:
\`\`\`python
from sklearn.ensemble import RandomForestClassifier

rf = RandomForestClassifier(n_estimators=200, max_depth=10, random_state=42)
rf.fit(X_train, y_train)

# Feature importance
importances = pd.Series(rf.feature_importances_, index=feature_names)
importances.nlargest(10).plot(kind="barh")
\`\`\`

Random Forests almost always outperform a single tree with very little tuning — a great first model to try on any tabular dataset.`,
            },
        ],
    },
    {
        title: 'Deep Learning & Neural Networks',
        description:
            'Dive deep into neural networks, backpropagation, CNNs, and RNNs using TensorFlow and Keras. Build image classifiers, text generators, and your first transformer-based model. Ideal for anyone who wants to work with cutting-edge AI.',
        thumbnail_url:
            'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=800&q=80',
        lessons: [
            {
                order_number: 1,
                title: 'Neurons, Layers & Backpropagation',
                video_url: 'https://www.youtube.com/embed/aircAruvnKk',
                content_text: `The mathematical foundation that makes deep learning work.

**A neuron:** computes a weighted sum of its inputs, applies an activation function, and passes the result forward.

**Activation functions:**
- **ReLU** — f(x) = max(0, x) — the default hidden-layer activation
- **Sigmoid** — squashes output to (0, 1) — used in binary classification output
- **Softmax** — converts logits to a probability distribution — multiclass output

**Backpropagation** computes the gradient of the loss with respect to every weight using the chain rule of calculus. The optimiser (e.g., Adam) then updates the weights in the direction that reduces loss.

**Building a simple MLP in Keras:**
\`\`\`python
from tensorflow import keras

model = keras.Sequential([
    keras.layers.Dense(128, activation="relu", input_shape=(784,)),
    keras.layers.Dropout(0.2),
    keras.layers.Dense(64, activation="relu"),
    keras.layers.Dense(10, activation="softmax"),
])
model.compile(optimizer="adam", loss="sparse_categorical_crossentropy", metrics=["accuracy"])
model.summary()
\`\`\``,
            },
            {
                order_number: 2,
                title: 'Convolutional Neural Networks (CNNs)',
                video_url: 'https://www.youtube.com/embed/YRhxdVk_sIs',
                content_text: `CNNs are the gold standard for image understanding tasks.

**Key building blocks:**
- **Conv2D layer** — learns spatial filters that detect edges, textures, and shapes
- **MaxPooling2D** — down-samples feature maps, adding translational invariance
- **Flatten + Dense** — final classification head

**Image classification with Keras:**
\`\`\`python
model = keras.Sequential([
    keras.layers.Conv2D(32, (3,3), activation="relu", input_shape=(32,32,3)),
    keras.layers.MaxPooling2D(2,2),
    keras.layers.Conv2D(64, (3,3), activation="relu"),
    keras.layers.MaxPooling2D(2,2),
    keras.layers.Flatten(),
    keras.layers.Dense(128, activation="relu"),
    keras.layers.Dense(10, activation="softmax"),
])
model.compile(optimizer="adam", loss="sparse_categorical_crossentropy", metrics=["accuracy"])
history = model.fit(X_train, y_train, epochs=15, validation_split=0.1)
\`\`\`

Transfer learning with pre-trained models (ResNet, EfficientNet) can achieve state-of-the-art accuracy with only a few hundred images.`,
            },
            {
                order_number: 3,
                title: 'Recurrent Networks & LSTMs for Sequences',
                video_url: 'https://www.youtube.com/embed/WCUNFb-GS0s',
                content_text: `RNNs and LSTMs are designed for sequential data — text, time series, audio.

**The vanishing gradient problem:** plain RNNs struggle to learn long-range dependencies because gradients shrink exponentially as they flow back through time.

**LSTMs solve this** with three gating mechanisms:
- **Forget gate** — decides what to discard from cell state
- **Input gate** — decides what new information to store
- **Output gate** — decides what to output

**Sentiment analysis example:**
\`\`\`python
model = keras.Sequential([
    keras.layers.Embedding(input_dim=10000, output_dim=128),
    keras.layers.LSTM(64, return_sequences=False),
    keras.layers.Dense(1, activation="sigmoid"),
])
model.compile(optimizer="adam", loss="binary_crossentropy", metrics=["accuracy"])
\`\`\`

For most NLP tasks today, Transformer models (BERT, GPT) have surpassed LSTMs — but understanding LSTMs is essential for understanding why Transformers were invented.`,
            },
            {
                order_number: 4,
                title: 'Introduction to the Transformer Architecture',
                video_url: 'https://www.youtube.com/embed/SZorAJ4I-sA',
                content_text: `"Attention is All You Need" — the 2017 paper that changed AI forever.

**Core idea — Self-Attention:**
Each token in a sequence computes a weighted sum of all other tokens, allowing the model to capture long-range dependencies in a single step (no recurrence needed).

**The Transformer block:**
1. Multi-Head Self-Attention
2. Add & LayerNorm (residual connection)
3. Feed-Forward Network
4. Add & LayerNorm

**Using Hugging Face for fine-tuning:**
\`\`\`python
from transformers import AutoTokenizer, AutoModelForSequenceClassification, Trainer

tokenizer = AutoTokenizer.from_pretrained("bert-base-uncased")
model = AutoModelForSequenceClassification.from_pretrained("bert-base-uncased", num_labels=2)

# Tokenise your dataset, create a Trainer, and fine-tune in a few lines!
\`\`\`

Models like GPT-4, Gemini, and Claude are all Transformer-based. Understanding this architecture is the single most valuable thing you can learn in modern AI.`,
            },
        ],
    },
];

// ─── Seed Function ─────────────────────────────────────────────────────────────

async function seed() {
    console.log('🌱 Starting EduFlow seed...\n');

    try {
        // 1. Clear dependent tables first to respect FK constraints, then core tables
        console.log('🗑️  Clearing existing data...');
        await db.query(`
      TRUNCATE TABLE
        discussions, reviews, lesson_progress,
        enrollments, questions, quizzes,
        lessons, courses, users
      RESTART IDENTITY CASCADE
    `);
        console.log('   ✓ Tables cleared\n');

        // 2. Insert users
        console.log('👤 Inserting users...');
        const insertedUsers = {};

        for (const user of USERS) {
            const hash = await bcrypt.hash(user.password, 12);
            const result = await db.query(
                `INSERT INTO users (username, email, password_hash, role)
         VALUES ($1, $2, $3, $4) RETURNING id, username, role`,
                [user.username, user.email, hash, user.role]
            );
            const row = result.rows[0];
            insertedUsers[row.role] = row.id;
            console.log(`   ✓ ${row.role.padEnd(8)} → ${row.username}  (pass: ${user.password})`);
        }

        const teacherId = insertedUsers['teacher'];
        console.log();

        // 3. Insert courses + lessons
        console.log('📚 Inserting courses and lessons...');
        for (const course of COURSES) {
            const courseRes = await db.query(
                `INSERT INTO courses (title, description, thumbnail_url, teacher_id)
         VALUES ($1, $2, $3, $4) RETURNING id, title`,
                [course.title, course.description, course.thumbnail_url, teacherId]
            );
            const courseRow = courseRes.rows[0];
            console.log(`\n   📖 Course: "${courseRow.title}"`);

            for (const lesson of course.lessons) {
                await db.query(
                    `INSERT INTO lessons (course_id, order_number, title, video_url, content_text)
           VALUES ($1, $2, $3, $4, $5)`,
                    [courseRow.id, lesson.order_number, lesson.title, lesson.video_url, lesson.content_text]
                );
                console.log(`      ✓ Lesson ${lesson.order_number}: ${lesson.title}`);
            }
        }

        console.log('\n✅ Seed complete!\n');
        console.log('─'.repeat(50));
        console.log('Test credentials:');
        console.log('  Teacher  →  instructor@eduflow.dev  /  Teacher@123');
        console.log('  Student  →  student@eduflow.dev     /  Student@123');
        console.log('─'.repeat(50));
    } catch (err) {
        console.error('\n❌ Seed failed:', err.message);
        process.exit(1);
    } finally {
        await db.end?.(); // close pool if db exposes .end()
        process.exit(0);
    }
}

seed();
