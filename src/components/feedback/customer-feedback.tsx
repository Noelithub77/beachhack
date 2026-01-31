"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Smile, Meh, Frown, Volume2, Search, ThumbsUp, Clock, MessageSquare } from "lucide-react";

export type FeedbackType = "call" | "chat" | "ticket";

export interface FeedbackData {
  satisfaction: number;
  quality: number; // voice quality for call, response quality for others
  helpfulness: number;
}

interface CustomerFeedbackProps {
  type: FeedbackType;
  onSubmit: (data: FeedbackData) => void;
  onSkip: () => void;
  vendorName?: string;
}

export function CustomerFeedback({ type, onSubmit, onSkip, vendorName = "SAGE" }: CustomerFeedbackProps) {
  const [satisfaction, setSatisfaction] = useState([8]);
  const [quality, setQuality] = useState([9]);
  const [helpfulness, setHelpfulness] = useState([8]);

  const handleSubmit = () => {
    onSubmit({
      satisfaction: satisfaction[0],
      quality: quality[0],
      helpfulness: helpfulness[0],
    });
  };

  const getEmotionIcon = (value: number) => {
    if (value >= 8) return <Smile className="h-5 w-5 text-green-500" />;
    if (value >= 5) return <Meh className="h-5 w-5 text-yellow-500" />;
    return <Frown className="h-5 w-5 text-red-500" />;
  };

  const getTitle = () => {
    switch (type) {
      case "call": return "Call Ended";
      case "chat": return "Chat Ended";
      case "ticket": return "Ticket Resolved";
      default: return "Feedback";
    }
  };

  const getQualityLabel = () => {
    switch (type) {
      case "call": return "Voice Clarity";
      case "chat": return "Response Quality";
      case "ticket": return "Communication Quality";
      default: return "Quality";
    }
  };

  const getQualityIcon = () => {
    switch (type) {
      case "call": return <Volume2 className="h-4 w-4 text-primary" />;
      case "chat": return <MessageSquare className="h-4 w-4 text-primary" />;
      case "ticket": return <MessageSquare className="h-4 w-4 text-primary" />;
      default: return <ThumbsUp className="h-4 w-4 text-primary" />;
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg border-primary/20 animate-in fade-in zoom-in duration-300">
      <CardHeader className="text-center pb-2">
        <CardTitle className="text-xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
          {getTitle()}
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          How was your experience with {vendorName}?
        </p>
      </CardHeader>
      
      <CardContent className="space-y-8 pt-6">
        {/* Satisfaction */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ThumbsUp className="h-4 w-4 text-primary" />
              <label className="text-sm font-medium">Overall Satisfaction</label>
            </div>
            <span className="text-sm font-bold w-12 text-right flex items-center justify-end gap-2">
              {satisfaction[0]}/10 {getEmotionIcon(satisfaction[0])}
            </span>
          </div>
          <Slider
            defaultValue={[8]}
            max={10}
            step={1}
            value={satisfaction}
            onValueChange={setSatisfaction}
            className="cursor-pointer"
          />
        </div>

        {/* Quality (Voice/Response) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getQualityIcon()}
              <label className="text-sm font-medium">{getQualityLabel()}</label>
            </div>
            <span className="text-sm font-bold w-8 text-right">{quality[0]}/10</span>
          </div>
          <Slider
            defaultValue={[9]}
            max={10}
            step={1}
            value={quality}
            onValueChange={setQuality}
            className="cursor-pointer"
          />
        </div>

        {/* Helpfulness */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-primary" />
              <label className="text-sm font-medium">Resolution & Help</label>
            </div>
            <span className="text-sm font-bold w-8 text-right">{helpfulness[0]}/10</span>
          </div>
          <Slider
            defaultValue={[8]}
            max={10}
            step={1}
            value={helpfulness}
            onValueChange={setHelpfulness}
            className="cursor-pointer"
          />
        </div>
      </CardContent>

      <CardFooter className="flex gap-3 pt-2">
        <Button variant="outline" className="flex-1" onClick={onSkip}>
          Skip
        </Button>
        <Button className="flex-1 bg-gradient-to-r from-primary to-purple-600 hover:opacity-90 transition-opacity" onClick={handleSubmit}>
          Submit Feedback
        </Button>
      </CardFooter>
    </Card>
  );
}
