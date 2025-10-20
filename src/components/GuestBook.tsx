"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

interface Message {
  id: string;
  name: string;
  message: string;
  timestamp: string;
}

export default function GuestBook() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const storedMessages = localStorage.getItem("guestbook-messages");
    if (storedMessages) {
      setMessages(JSON.parse(storedMessages));
    }
  }, []);

  const saveMessages = (newMessages: Message[]) => {
    setMessages(newMessages);
    localStorage.setItem("guestbook-messages", JSON.stringify(newMessages));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      name: name.trim(),
      message: message.trim(),
      timestamp: new Date().toISOString(),
    };

    const updatedMessages = [newMessage, ...messages];
    saveMessages(updatedMessages);
    setName("");
    setMessage("");
  };

  return (
    <>
      {/* Section Separator */}
      <div className="bg-ivory py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center">
            <div className="h-px w-32 bg-gold/30"></div>
            <div className="mx-6 w-2 h-2 bg-gold rotate-45"></div>
            <div className="h-px w-32 bg-gold/30"></div>
          </div>
        </div>
      </div>

      <section
        ref={sectionRef}
        id="guestbook"
        className={`section-spacing bg-ivory transition-all duration-700 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
      >
        <div className="container mx-auto px-4">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="flex items-center justify-center mb-6">
              <div className="h-px w-20 bg-gold"></div>
              <div className="mx-4 w-3 h-3 border-2 border-gold rotate-45"></div>
              <div className="h-px w-20 bg-gold"></div>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 mb-4">
              Libro de Visitas
            </h2>
            <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
              Déjanos tus mejores deseos y felicitaciones para nuestro día
              especial
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            {/* Form */}
            <Card className="mb-12">
              <CardHeader>
                <CardTitle>Deja tu mensaje</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Input
                      type="text"
                      placeholder="Tu nombre"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Textarea
                      placeholder="Tu mensaje de felicitación..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={4}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Enviar mensaje
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Messages List */}
            <div className="space-y-6">
              {messages.map((msg, index) => (
                <Card
                  key={msg.id}
                  className={`transition-all duration-700 ${
                    isVisible
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-10"
                  }`}
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-800">
                        {msg.name}
                      </h3>
                      <span className="text-sm text-gray-500">
                        {new Date(msg.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-700">{msg.message}</p>
                  </CardContent>
                </Card>
              ))}
              {messages.length === 0 && (
                <div className="text-center text-gray-500 py-12">
                  <p>Sé el primero en dejar un mensaje de felicitación.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
