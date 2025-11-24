# Gemini CLI Setup Guide

## Installation

1. **Install Gemini CLI**:
   \`\`\`bash
   # Install via npm (recommended)
   npm install -g @google/generative-ai-cli
   
   # Or download from GitHub releases
   # https://github.com/google/generative-ai-cli/releases
   \`\`\`

2. **Authentication**:
   \`\`\`bash
   # Set up your API key (free tier available)
   gemini auth login
   
   # Or set environment variable
   export GEMINI_API_KEY="your-api-key-here"
   \`\`\`

3. **Verify Installation**:
   \`\`\`bash
   gemini --version
   gemini health-check
   \`\`\`

## Free Tier Benefits

- **60 requests per minute**
- **1,000 requests per day**
- **1M token context window**
- **Built-in Google Search**
- **File processing capabilities**
- **No credit card required**

## Usage Examples

### Basic Chat
\`\`\`bash
gemini chat --model gemini-2.0-flash-exp "Hello, how are you?"
\`\`\`

### With File Processing
\`\`\`bash
gemini chat --file document.pdf "Summarize this document"
\`\`\`

### With Web Search
\`\`\`bash
gemini chat --tools google_search "Latest AI research findings"
\`\`\`

### Character-based Chat
\`\`\`bash
gemini chat --prompt "You are Ibn Sina, the great physician" "What is your medical advice?"
\`\`\`

## Integration with AI Companion

The AI companion system now uses Gemini CLI for:

1. **Character Conversations** - All 6 personas powered by Gemini
2. **Data Analysis** - Using 1M token context for large datasets
3. **Web Search** - Built-in Google Search integration
4. **File Processing** - Document analysis and processing
5. **Research Assistance** - Scientific research and insights

## Cost Comparison

| Feature | OpenAI GPT-4 | Gemini CLI |
|---------|--------------|------------|
| Cost | $0.03/1K tokens | **FREE** |
| Context Window | 128K tokens | **1M tokens** |
| Web Search | External API needed | **Built-in** |
| File Processing | Limited | **Native support** |
| Rate Limits | Pay-per-use | 60/min, 1000/day |

## Troubleshooting

### Common Issues

1. **"gemini command not found"**
   - Ensure CLI is installed globally
   - Check PATH environment variable

2. **Authentication errors**
   - Run `gemini auth login`
   - Verify API key is set correctly

3. **Rate limit exceeded**
   - Free tier: 60 requests/minute, 1000/day
   - Implement request queuing in production

### Performance Tips

1. **Use file input for long prompts** to avoid command line limits
2. **Enable caching** for repeated queries
3. **Batch similar requests** to optimize rate limits
4. **Use appropriate temperature** settings (0.3 for analysis, 0.7 for creative)

## Production Deployment

For production deployment:

1. **Set up proper error handling** for rate limits
2. **Implement request queuing** for high-volume usage
3. **Monitor usage** to stay within free tier limits
4. **Consider upgrading** to paid tier for higher limits if needed

## Security Notes

- API keys should be stored securely
- Use environment variables, not hardcoded keys
- Implement proper access controls
- Monitor usage for unusual patterns
