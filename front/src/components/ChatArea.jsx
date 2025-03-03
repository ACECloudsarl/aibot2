"use client";
import { Card, CardContent } from "@/components/ui/card";
import Markdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Copy, Download } from "lucide-react";

export default function ChatArea({ messages, messagesEndRef, isLoading, handleCopyCode, handleSaveCode }) {
  return (
    <main className="flex-1 overflow-auto p-4 md:p-6 space-y-4">
      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[calc(100vh-16rem)] text-center space-y-4">
          <img src="/bot-icon.svg" alt="Bot" className="h-16 w-16 text-muted-foreground" />
          <h2 className="text-2xl font-bold">How can I help you today?</h2>
          <p className="text-muted-foreground max-w-md">
            Ask me anything or select from the suggested prompts below
          </p>
          <div className="flex flex-wrap gap-2 justify-center max-w-2xl">
            {["Explain quantum computing", "Write a poem about AI", "Help me debug my React code", "Create a marketing strategy"].map((prompt) => (
              <Button
                key={prompt}
                variant="outline"
                className="rounded-full"
                onClick={() => {} /* could set the input value here */}
              >
                {prompt}
              </Button>
            ))}
          </div>
        </div>
      ) : (
        messages.map((message) => (
          <Card
            key={message.id}
            className={`border-0 ${message.role === "user" ? "bg-primary-foreground" : "bg-card"} ${message.isStreaming ? "border-l-4 border-l-primary" : ""}`}
          >
            <CardContent className="p-4">
              <div className="prose dark:prose-invert prose-sm sm:prose-base max-w-none">
                {message.role === "user" ? (
                  <p>{message.content}</p>
                ) : message.isImage ? (
                  <div className="flex flex-col items-center">
                    <img 
                      src={message.content} 
                      alt="AI Generated" 
                      className="max-w-full rounded-md" 
                    />
                    <div className="mt-2 text-sm text-muted-foreground">
                      Generated with FLUX.1
                    </div>
                  </div>
                ) : (
                  <Markdown
                    components={{
                      code({ node, inline, className, children, ...props }) {
                        const match = /language-(\w+)/.exec(className || "");
                        const code = String(children).replace(/\n$/, "");
                        if (!inline && match) {
                          return (
                            <div className="relative">
                              <pre className={className} {...props}>
                                <code>{children}</code>
                              </pre>
                              <div className="absolute top-2 right-2 flex space-x-2">
                                <Button variant="ghost" size="icon" onClick={() => handleCopyCode(code)}>
                                  <Copy className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => handleSaveCode(code)}>
                                  <Download className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          );
                        }
                        return <code className={className} {...props}>{children}</code>;
                      },
                    }}
                  >
                    {message.content || " "}
                  </Markdown>
                )}
              </div>
            </CardContent>
          </Card>
        ))
      )}
      <div ref={messagesEndRef} />
      {isLoading && !messages.some((msg) => msg.isStreaming) && (
        <Card className="border-0 bg-card animate-pulse">
          <CardContent className="p-4">
            <div className="h-5 bg-muted rounded w-3/4 mb-2"></div>
            <div className="h-5 bg-muted rounded w-1/2"></div>
          </CardContent>
        </Card>
      )}
    </main>
  );
}
