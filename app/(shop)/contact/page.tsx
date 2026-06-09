"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Mail, Phone, MapPin, Clock, Send } from "lucide-react";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email("Invalid email"),
  subject: z.string().min(3),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type FormData = z.infer<typeof schema>;

const contactInfo = [
  { icon: Mail, title: "Email", value: "hello@luminarystore.com", href: "mailto:hello@luminarystore.com" },
  { icon: Phone, title: "Phone", value: "+1 (555) 000-0000", href: "tel:+15550000000" },
  { icon: MapPin, title: "Address", value: "123 Commerce St, New York, NY 10001" },
  { icon: Clock, title: "Hours", value: "Mon–Fri, 9am–6pm EST" },
];

export default function ContactPage() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    setSent(true);
    reset();
    toast.success("Message sent! We'll get back to you within 24 hours.");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="max-w-2xl mb-14">
        <p className="text-sm text-muted-foreground uppercase tracking-widest mb-3">Get in touch</p>
        <h1 className="text-4xl font-bold tracking-tight mb-4">We&apos;d love to hear from you</h1>
        <p className="text-muted-foreground text-lg">
          Have a question about an order, product, or partnership? Send us a message and we&apos;ll get back to you quickly.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
        {/* Info */}
        <div className="lg:col-span-2 space-y-6">
          {contactInfo.map(({ icon: Icon, title, value, href }) => (
            <div key={title} className="flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                <Icon className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5">{title}</p>
                {href ? (
                  <a href={href} className="text-sm font-medium hover:underline underline-offset-4">{value}</a>
                ) : (
                  <p className="text-sm font-medium">{value}</p>
                )}
              </div>
            </div>
          ))}

          <div className="mt-8 rounded-2xl bg-foreground text-background p-6">
            <h3 className="font-semibold mb-2">Quick Response Guarantee</h3>
            <p className="text-background/70 text-sm">We respond to all inquiries within 24 hours on business days.</p>
          </div>
        </div>

        {/* Form */}
        <div className="lg:col-span-3">
          {sent ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-16 rounded-2xl border border-border bg-card">
              <div className="w-16 h-16 rounded-2xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
                <Send className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Message sent!</h2>
              <p className="text-muted-foreground mb-6">We&apos;ll get back to you within 24 hours.</p>
              <Button variant="outline" onClick={() => setSent(false)}>Send another</Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="rounded-2xl border border-border bg-card p-6 sm:p-8 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <Label htmlFor="contact-name">Your name</Label>
                  <Input id="contact-name" placeholder="John Doe" {...register("name")} />
                  {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="contact-email">Email address</Label>
                  <Input id="contact-email" type="email" placeholder="you@example.com" {...register("email")} />
                  {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="contact-subject">Subject</Label>
                <Input id="contact-subject" placeholder="Order question, product inquiry..." {...register("subject")} />
                {errors.subject && <p className="text-xs text-red-500">{errors.subject.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="contact-message">Message</Label>
                <Textarea id="contact-message" rows={6} placeholder="Tell us how we can help..." {...register("message")} />
                {errors.message && <p className="text-xs text-red-500">{errors.message.message}</p>}
              </div>

              <Button type="submit" size="lg" className="w-full" loading={loading}>
                <Send className="w-4 h-4" />
                {loading ? "Sending..." : "Send Message"}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
