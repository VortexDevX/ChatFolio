import { ChatMessage } from '@/types/chat';

export interface RedactionRule {
  name: string;
  regex: RegExp;
  mask: string;
}

export const REDACTION_RULES: RedactionRule[] = [
  {
    name: 'OpenAI Project / Service Token',
    regex: /\b(sk-(?:proj|svcacct)-[a-zA-Z0-9_-]{20,})\b/g,
    mask: '[REDACTED_API_KEY]',
  },
  {
    name: 'OpenAI / Anthropic API Key',
    regex: /\b(sk-[a-zA-Z0-9_-]{20,})\b/g,
    mask: '[REDACTED_API_KEY]',
  },
  {
    name: 'AWS Access Key ID',
    regex: /\b(AKIA[0-9A-Z]{16})\b/g,
    mask: '[REDACTED_AWS_KEY]',
  },
  {
    name: 'GitHub Token',
    regex: /\b(gh[pousr]_[A-Za-z0-9_]{36,255})\b/g,
    mask: '[REDACTED_GITHUB_TOKEN]',
  },
  {
    name: 'Email Address',
    regex: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
    mask: '[REDACTED_EMAIL]',
  },
  {
    name: 'IPv4 Address',
    regex: /\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/g,
    mask: '[REDACTED_IP]',
  },
  {
    name: 'Database Connection String',
    regex: /(postgres(?:ql)?|mysql|mongodb(?:\+srv)?|redis):\/\/[^:\s]+:([^@\s]+)@([^\s]+)/gi,
    mask: '$1://admin:[REDACTED_SECRET]@$3',
  },
  {
    name: 'Authorization Bearer Token',
    regex: /bearer\s+[a-zA-Z0-9_\-\.]{25,}/gi,
    mask: 'Bearer [REDACTED_TOKEN]',
  },
  {
    name: 'Private Key Block',
    regex: /-----BEGIN [A-Z ]+PRIVATE KEY-----[\s\S]+?-----END [A-Z ]+PRIVATE KEY-----/g,
    mask: '[REDACTED_PRIVATE_KEY]',
  },
];

export function redactMessageContent(text: string): { content: string; count: number } {
  let count = 0;
  let result = text;

  for (const rule of REDACTION_RULES) {
    rule.regex.lastIndex = 0;
    const matches = result.match(rule.regex);
    if (matches) {
      count += matches.length;
      rule.regex.lastIndex = 0;
      result = result.replace(rule.regex, rule.mask);
    }
    rule.regex.lastIndex = 0;
  }

  return { content: result, count };
}

export function redactConversation(
  messages: ChatMessage[]
): { messages: ChatMessage[]; count: number } {
  let totalCount = 0;

  const newMessages = messages.map((msg) => {
    const { content, count: contentCount } = redactMessageContent(msg.content);
    let thought = msg.thought;
    let thoughtCount = 0;
    if (thought) {
      const res = redactMessageContent(thought);
      thought = res.content;
      thoughtCount = res.count;
    }
    totalCount += (contentCount + thoughtCount);
    return {
      ...msg,
      content,
      thought,
    };
  });

  return { messages: newMessages, count: totalCount };
}
