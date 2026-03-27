import { CodeBlock } from "@/components/code-block"
import Link from "next/link"
import { ArrowRight, CreditCard, MessageSquare, Image, TrendingUp } from "lucide-react"

const examples = [
  {
    title: "Fraud Detection",
    description: "Real-time fraud detection for financial transactions with explainable predictions.",
    icon: CreditCard,
    tags: ["classification", "real-time", "explainability"],
  },
  {
    title: "Sentiment Analysis",
    description: "Analyze customer feedback and reviews with multi-label classification.",
    icon: MessageSquare,
    tags: ["nlp", "classification", "batch"],
  },
  {
    title: "Image Classification",
    description: "Classify product images with automatic retraining on new categories.",
    icon: Image,
    tags: ["computer-vision", "self-retraining", "drift-detection"],
  },
  {
    title: "Demand Forecasting",
    description: "Predict product demand with time-series models and automatic data snapshots.",
    icon: TrendingUp,
    tags: ["time-series", "regression", "scheduled-training"],
  },
]

export default function ExamplesPage() {
  return (
    <div>
      <h1 className="text-4xl font-bold tracking-tight text-foreground">
        Examples
      </h1>
      <p className="mt-4 text-lg text-muted-foreground">
        Real-world examples demonstrating Pulse capabilities for common ML use cases.
      </p>

      <section className="mt-12">
        <h2 className="text-2xl font-semibold text-foreground">Use Cases</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {examples.map((example) => {
            const Icon = example.icon
            return (
              <div
                key={example.title}
                className="group rounded-lg border border-border bg-card/50 p-6 transition-all hover:border-primary/50"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="mt-4 font-semibold text-foreground">
                  {example.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {example.description}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {example.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-semibold text-foreground">
          Fraud Detection Example
        </h2>
        <p className="mt-4 text-muted-foreground">
          A complete example of building a fraud detection system with Pulse.
        </p>

        <h3 className="mt-8 text-xl font-semibold text-foreground">
          1. Model Definition
        </h3>
        <div className="mt-4">
          <CodeBlock
            code={`# models/fraud-detector.model.yaml
model: fraud-detector
version: "1.0.0"
runtime: python3.11

input:
  type: object
  properties:
    transaction_id:
      type: string
      format: uuid
    amount:
      type: number
      minimum: 0
    merchant_category:
      type: string
      enum: [retail, electronics, travel, food, services]
    user_location:
      type: object
      properties:
        lat:
          type: number
        lng:
          type: number
    device_fingerprint:
      type: string
    time_of_day:
      type: number
      minimum: 0
      maximum: 24

output:
  type: object
  properties:
    is_fraud:
      type: boolean
    confidence:
      type: number
      minimum: 0
      maximum: 1
    risk_factors:
      type: array
      items:
        type: string
    recommended_action:
      type: string
      enum: [approve, review, decline]

training:
  datasource: transactions-db
  snapshot: required
  schedule: "0 2 * * *"
  validation:
    split: 0.2
    metrics:
      - accuracy
      - precision
      - recall
      - f1_score
      - auc_roc

inference:
  timeout: 50ms
  retries: 2
  cache:
    enabled: true
    ttl: 0  # No caching for fraud detection
  
drift:
  enabled: true
  baseline: training
  threshold: 0.1
  metrics:
    - feature_distribution
    - prediction_distribution
  action: notify`}
            language="yaml"
          />
        </div>

        <h3 className="mt-8 text-xl font-semibold text-foreground">
          2. Datasource Configuration
        </h3>
        <div className="mt-4">
          <CodeBlock
            code={`# datasources/transactions-db.datasource.yaml
datasource: transactions-db
type: postgresql

connection:
  host: \${POSTGRES_HOST}
  port: 5432
  database: fraud_detection
  user: \${POSTGRES_USER}
  password: \${POSTGRES_PASSWORD}
  ssl: required

schema:
  table: transactions
  columns:
    - name: id
      type: uuid
      primary: true
    - name: amount
      type: decimal
    - name: merchant_category
      type: string
    - name: user_lat
      type: decimal
    - name: user_lng
      type: decimal
    - name: device_fingerprint
      type: string
    - name: created_at
      type: timestamp
    - name: is_fraud
      type: boolean
      label: true  # This is the training label

query:
  filter: "created_at >= NOW() - INTERVAL '90 days'"
  
snapshot:
  strategy: incremental
  column: created_at
  retention: 180d`}
            language="yaml"
          />
        </div>

        <h3 className="mt-8 text-xl font-semibold text-foreground">
          3. Training Script
        </h3>
        <div className="mt-4">
          <CodeBlock
            code={`# training/train.py
import pulse
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.preprocessing import StandardScaler
import joblib

def train(data, config):
    """Train fraud detection model."""
    
    # Prepare features
    X = data[['amount', 'merchant_category_encoded', 
              'user_lat', 'user_lng', 'hour_of_day']]
    y = data['is_fraud']
    
    # Scale features
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    
    # Train model
    model = GradientBoostingClassifier(
        n_estimators=100,
        max_depth=6,
        learning_rate=0.1,
        random_state=42
    )
    model.fit(X_scaled, y)
    
    # Save artifacts
    pulse.save_artifact('model.joblib', model)
    pulse.save_artifact('scaler.joblib', scaler)
    
    # Log metrics
    pulse.log_metric('accuracy', model.score(X_scaled, y))
    
    return model

def infer(input_data, artifacts):
    """Run inference on new transaction."""
    
    model = artifacts['model.joblib']
    scaler = artifacts['scaler.joblib']
    
    # Prepare features
    features = prepare_features(input_data)
    features_scaled = scaler.transform([features])
    
    # Predict
    proba = model.predict_proba(features_scaled)[0]
    is_fraud = proba[1] > 0.5
    
    # Get risk factors
    risk_factors = explain_prediction(model, features_scaled)
    
    return {
        'is_fraud': is_fraud,
        'confidence': float(proba[1]),
        'risk_factors': risk_factors,
        'recommended_action': get_action(proba[1])
    }`}
            language="python"
          />
        </div>

        <h3 className="mt-8 text-xl font-semibold text-foreground">
          4. Deploy and Test
        </h3>
        <div className="mt-4">
          <CodeBlock
            code={`# Validate configuration
pulse validate

# Create initial snapshot
pulse snapshot transactions-db

# Train the model
pulse train fraud-detector --watch

# Deploy to production
pulse deploy fraud-detector

# Test inference
curl -X POST https://api.pulse.dev/v1/infer/fraud-detector \\
  -H "Authorization: Bearer $PULSE_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "transaction_id": "550e8400-e29b-41d4-a716-446655440000",
    "amount": 1500.00,
    "merchant_category": "electronics",
    "user_location": {"lat": 40.7128, "lng": -74.0060},
    "device_fingerprint": "abc123",
    "time_of_day": 14.5
  }'

# Response
{
  "is_fraud": false,
  "confidence": 0.12,
  "risk_factors": [],
  "recommended_action": "approve"
}`}
            language="bash"
          />
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-semibold text-foreground">
          More Examples
        </h2>
        <p className="mt-4 text-muted-foreground">
          Find more examples in our GitHub repository:
        </p>
        <div className="mt-4">
          <Link
            href="https://github.com/DiogoAngelim/pulse/tree/main/examples"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-primary hover:underline"
          >
            View all examples on GitHub
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  )
}
