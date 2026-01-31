"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { useAuthStore } from "@/stores/auth-store";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CheckCircle,
  Loader2,
  MessageCircle,
  Phone,
  Mail,
  AlertCircle,
  AlertTriangle,
  Info,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

const categories = [
  { value: "billing", label: "Billing & Payments" },
  { value: "technical", label: "Technical Issue" },
  { value: "account", label: "Account Management" },
  { value: "product", label: "Product Question" },
  { value: "general", label: "General Inquiry" },
];

const severityLevels = [
  {
    value: "minor",
    label: "Minor",
    description: "Small inconvenience, workaround available",
    icon: Info,
    color: "text-blue-500",
  },
  {
    value: "moderate",
    label: "Moderate",
    description: "Affecting my work but manageable",
    icon: AlertCircle,
    color: "text-yellow-500",
  },
  {
    value: "major",
    label: "Major",
    description: "Significantly impacting my business",
    icon: AlertTriangle,
    color: "text-orange-500",
  },
  {
    value: "critical",
    label: "Critical",
    description: "Complete service outage or data loss",
    icon: Zap,
    color: "text-red-500",
  },
];

const urgencyLevels = [
  { value: "low", label: "Low", description: "When you get a chance" },
  { value: "medium", label: "Medium", description: "Within a few days" },
  { value: "high", label: "High", description: "Today if possible" },
  { value: "immediate", label: "Immediate", description: "Need help right now" },
];

const contactMethods = [
  {
    value: "chat",
    label: "Live Chat",
    description: "Chat with a representative in real-time",
    icon: MessageCircle,
  },
  {
    value: "email",
    label: "Email",
    description: "Receive a response via email",
    icon: Mail,
  },
  {
    value: "call",
    label: "Phone Call",
    description: "Get a callback from our team",
    icon: Phone,
  },
];

type Step = 1 | 2 | 3 | 4;

export default function IntakePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuthStore();

  const vendorId = searchParams.get("vendor");

  const vendor = useQuery(
    api.functions.vendors.getById,
    vendorId ? { id: vendorId as Id<"vendors"> } : "skip"
  );

  const createTicket = useMutation(api.functions.tickets.createFromIntake);

  const [step, setStep] = useState<Step>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ticketId, setTicketId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    subject: "",
    description: "",
    category: "",
    severity: "",
    urgency: "",
    preferredContact: "",
  });

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.subject.trim() && formData.description.trim() && formData.category;
      case 2:
        return formData.severity && formData.urgency;
      case 3:
        return formData.preferredContact;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (step < 4) {
      setStep((step + 1) as Step);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep((step - 1) as Step);
    }
  };

  const handleSubmit = async () => {
    if (!user?.id || !vendorId) return;

    setIsSubmitting(true);
    try {
      const result = await createTicket({
        customerId: user.id as Id<"users">,
        vendorId: vendorId as Id<"vendors">,
        subject: formData.subject,
        description: formData.description,
        category: formData.category,
        severity: formData.severity,
        urgency: formData.urgency,
        preferredContact: formData.preferredContact,
      });

      if (result.success) {
        setTicketId(result.ticketId);
        setStep(4);
      }
    } catch (error) {
      console.error("Failed to create ticket:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!vendorId) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-lg font-medium">No vendor selected</p>
        <Button
          variant="ghost"
          className="mt-4"
          onClick={() => router.push("/customer/vendors?mode=human")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Select a Vendor
        </Button>
      </div>
    );
  }

  if (vendor === undefined) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      {step !== 4 && (
        <>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/customer/vendors/${vendorId}?mode=human`)}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>

          <div className="text-center">
            <h1 className="text-2xl font-bold">Contact Support</h1>
            <p className="text-muted-foreground mt-1">
              Tell us about your issue with {vendor?.name}
            </p>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center gap-2">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                    step >= s
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {s}
                </div>
                {s < 3 && (
                  <div
                    className={cn(
                      "w-12 h-0.5 mx-1",
                      step > s ? "bg-primary" : "bg-muted"
                    )}
                  />
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* Step 1: Problem Description */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Describe Your Issue</CardTitle>
            <CardDescription>
              Tell us what's happening so we can help you faster
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject *</Label>
              <Input
                id="subject"
                placeholder="Brief summary of your issue"
                value={formData.subject}
                onChange={(e) => updateField("subject", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => updateField("category", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Please describe your issue in detail. Include any relevant information like error messages, steps to reproduce, or what you were trying to do."
                value={formData.description}
                onChange={(e) => updateField("description", e.target.value)}
                rows={5}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Severity & Urgency */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Priority Assessment</CardTitle>
            <CardDescription>
              Help us understand the impact and urgency of your issue
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label>Severity Level *</Label>
              <RadioGroup
                value={formData.severity}
                onValueChange={(value) => updateField("severity", value)}
                className="grid gap-3"
              >
                {severityLevels.map((level) => (
                  <Label
                    key={level.value}
                    htmlFor={`severity-${level.value}`}
                    className={cn(
                      "flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-colors",
                      formData.severity === level.value
                        ? "border-primary bg-primary/5"
                        : "hover:bg-muted/50"
                    )}
                  >
                    <RadioGroupItem
                      value={level.value}
                      id={`severity-${level.value}`}
                    />
                    <level.icon className={cn("h-5 w-5", level.color)} />
                    <div className="flex-1">
                      <p className="font-medium">{level.label}</p>
                      <p className="text-sm text-muted-foreground">
                        {level.description}
                      </p>
                    </div>
                  </Label>
                ))}
              </RadioGroup>
            </div>

            <div className="space-y-3">
              <Label>Urgency Level *</Label>
              <RadioGroup
                value={formData.urgency}
                onValueChange={(value) => updateField("urgency", value)}
                className="grid grid-cols-2 gap-3"
              >
                {urgencyLevels.map((level) => (
                  <Label
                    key={level.value}
                    htmlFor={`urgency-${level.value}`}
                    className={cn(
                      "flex flex-col p-4 rounded-lg border cursor-pointer transition-colors",
                      formData.urgency === level.value
                        ? "border-primary bg-primary/5"
                        : "hover:bg-muted/50"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <RadioGroupItem
                        value={level.value}
                        id={`urgency-${level.value}`}
                      />
                      <span className="font-medium">{level.label}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 ml-6">
                      {level.description}
                    </p>
                  </Label>
                ))}
              </RadioGroup>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Contact Method */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Contact Preference</CardTitle>
            <CardDescription>
              How would you like us to reach you?
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={formData.preferredContact}
              onValueChange={(value) => updateField("preferredContact", value)}
              className="grid gap-4"
            >
              {contactMethods.map((method) => (
                <Label
                  key={method.value}
                  htmlFor={`contact-${method.value}`}
                  className={cn(
                    "flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-colors",
                    formData.preferredContact === method.value
                      ? "border-primary bg-primary/5"
                      : "hover:bg-muted/50"
                  )}
                >
                  <RadioGroupItem
                    value={method.value}
                    id={`contact-${method.value}`}
                  />
                  <div className="rounded-lg bg-muted p-3">
                    <method.icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{method.label}</p>
                    <p className="text-sm text-muted-foreground">
                      {method.description}
                    </p>
                  </div>
                </Label>
              ))}
            </RadioGroup>

            {/* Summary */}
            <div className="mt-6 p-4 rounded-lg bg-muted/50 space-y-2">
              <p className="font-medium text-sm">Request Summary</p>
              <div className="text-sm space-y-1">
                <p>
                  <span className="text-muted-foreground">Subject:</span>{" "}
                  {formData.subject}
                </p>
                <p>
                  <span className="text-muted-foreground">Category:</span>{" "}
                  {categories.find((c) => c.value === formData.category)?.label}
                </p>
                <p>
                  <span className="text-muted-foreground">Severity:</span>{" "}
                  {severityLevels.find((s) => s.value === formData.severity)?.label}
                </p>
                <p>
                  <span className="text-muted-foreground">Urgency:</span>{" "}
                  {urgencyLevels.find((u) => u.value === formData.urgency)?.label}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Confirmation */}
      {step === 4 && (
        <Card className="text-center">
          <CardContent className="pt-12 pb-8">
            <div className="rounded-full bg-green-100 dark:bg-green-900/30 w-16 h-16 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Request Submitted!</h2>
            <p className="text-muted-foreground mb-6">
              Your support ticket has been created. Our team will reach out via{" "}
              {contactMethods.find((m) => m.value === formData.preferredContact)?.label?.toLowerCase()}{" "}
              shortly.
            </p>

            <div className="inline-block p-4 rounded-lg bg-muted/50 mb-6">
              <p className="text-sm text-muted-foreground">Ticket ID</p>
              <p className="font-mono font-medium">
                {ticketId?.slice(-8).toUpperCase()}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                variant="outline"
                onClick={() => router.push(`/customer/tickets/${ticketId}`)}
              >
                View Ticket
              </Button>
              <Button onClick={() => router.push("/customer/dashboard")}>
                Return to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation Buttons */}
      {step !== 4 && (
        <div className="flex justify-between">
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={step === 1}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          {step < 3 ? (
            <Button onClick={handleNext} disabled={!canProceed()}>
              Continue
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!canProceed() || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  Submit Request
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
