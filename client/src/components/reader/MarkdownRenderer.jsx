import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import { CalloutBox } from './CalloutBox.jsx';

// Custom schema allowing classes and data attributes for safe rendering
const sanitizeSchema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    div: [...(defaultSchema.attributes?.div || []), 'className', 'role', 'ariaLabel'],
    span: [...(defaultSchema.attributes?.span || []), 'className'],
    code: [...(defaultSchema.attributes?.code || []), 'className']
  }
};

export const MarkdownRenderer = ({ content = '' }) => {
  return (
    <div className="reader-content select-text">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[[rehypeSanitize, sanitizeSchema]]}
        components={{
          // Custom blockquote component detecting > [!TIP] syntax
          blockquote({ node, children, ...props }) {
            // Find text content inside children to check for [!TYPE]
            let calloutType = null;
            let strippedChildren = children;

            if (Array.isArray(children)) {
              const firstChild = children[0];
              if (
                firstChild &&
                firstChild.props &&
                firstChild.props.children
              ) {
                const text = Array.isArray(firstChild.props.children)
                  ? firstChild.props.children[0]
                  : firstChild.props.children;

                if (typeof text === 'string') {
                  const match = text.match(/^\[!(TIP|EXAMPLE|WARNING|NOTE)\]/i);
                  if (match) {
                    calloutType = match[1].toUpperCase();
                    // Replace the [!TYPE] tag in the first child paragraph
                    const cleanText = text.replace(/^\[!(TIP|EXAMPLE|WARNING|NOTE)\]\s*/i, '');
                    const updatedFirstParaChildren = Array.isArray(firstChild.props.children)
                      ? [cleanText, ...firstChild.props.children.slice(1)]
                      : cleanText;

                    const updatedFirstPara = React.cloneElement(firstChild, {
                      children: updatedFirstParaChildren
                    });

                    strippedChildren = [updatedFirstPara, ...children.slice(1)];
                  }
                }
              }
            }

            if (calloutType) {
              return <CalloutBox type={calloutType}>{strippedChildren}</CalloutBox>;
            }

            return <blockquote {...props}>{children}</blockquote>;
          },
          // Custom responsive table renderer
          table({ node, children, ...props }) {
            return (
              <div className="reader-table-container">
                <table {...props}>{children}</table>
              </div>
            );
          }
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
