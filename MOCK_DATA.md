# Mock Data Configuration

OneAsk supports mock data toggles for development and testing purposes, allowing you to test the system without requiring live Azure API connections.

## Environment Variables

Add these variables to your `.env` file:

```bash
# Mock Data Configuration
USE_MOCK_ADO=false      # Set to 'true' to use mock Azure DevOps data
USE_MOCK_TEAMS=false    # Set to 'true' to use mock Teams messages
```

## Mock Data Sources

### Azure DevOps Mock Data (`USE_MOCK_ADO=true`)

**Wiki Pages:**
- FinOps Cost Optimization Strategy
- Project Bonica Architecture Overview  
- API Development Standards
- Managed Data Lake - Technical Implementation
- Data Lake Migration Strategy
- Data Quality Framework

**Work Items:**
- Implement Bonica cost analytics dashboard
- EDT onboarding automation
- API rate limiting implementation
- Data Lake ingestion pipeline optimization
- Implement data governance policies in Purview
- Data Lake performance monitoring dashboard
- Data Lake disaster recovery implementation

### Teams Messages Mock Data (`USE_MOCK_TEAMS=true`)

**Sample Messages:**
- Project Bonica progress updates
- EDT onboarding improvements
- API rate limiting discussions
- FinOps best practices sharing
- Data Lake pipeline performance issues
- Purview data governance rollout update
- Data Lake monitoring dashboard demo
- Data Lake disaster recovery planning
- Data quality metrics improvement

### Engineering Hub Mock Data

**Documentation:**
- EDT Onboarding Guide
- Project Bonica - Latest Updates
- Deployment Best Practices
- API Design Standards
- FinOps Cost Optimization Guide
- Security Guidelines and Compliance
- Managed Data Lake - Architecture Overview
- Data Lake Onboarding Guide
- Data Lake Security and Governance
- Data Lake Performance Optimization
- Data Lake Monitoring and Alerting

## Usage Examples

### Enable All Mock Data
```bash
USE_MOCK_ADO=true
USE_MOCK_TEAMS=true
```

### Test Specific Data Sources
```bash
# Test only ADO integration
USE_MOCK_ADO=true
USE_MOCK_TEAMS=false

# Test only Teams integration  
USE_MOCK_ADO=false
USE_MOCK_TEAMS=true
```

## Benefits

- **No API Dependencies**: Test without Azure credentials
- **Consistent Data**: Predictable results for development
- **Faster Development**: No network latency or rate limits
- **Offline Testing**: Work without internet connectivity

## Sample Queries

With mock data enabled, try these test queries:

### General Queries
- "What's the latest on Project Bonica?"
- "EDT onboarding"
- "API standards"
- "FinOps best practices"

### Managed Data Lake Queries
- "Managed Data Lake architecture"
- "Data Lake performance optimization"
- "Data quality metrics"
- "Data governance policies"
- "Data Lake migration strategy"
- "Azure Purview configuration"
- "Data Factory pipeline optimization"
- "Data Lake monitoring and alerting"
- "Disaster recovery for Data Lake"
- "Data Lake security and compliance"

The mock data is designed to provide realistic responses for common OneAsk use cases across multiple Microsoft workplace tools.