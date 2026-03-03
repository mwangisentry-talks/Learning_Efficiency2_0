from django.db import models

class LearningRecord(models.Model):
    title = models.CharField(max_length=255)
    time_spent = models.FloatField()          # Ts
    concept_links = models.FloatField()       # Cl
    knowledge_gaps = models.FloatField()      # Kg
    research_questions = models.FloatField()  # Rq
    learning_efficiency = models.FloatField(blank=True, null=True)
    max_efficiency = models.FloatField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if self.knowledge_gaps > 0 and self.research_questions > 0:
            # Current efficiency
            self.learning_efficiency = (
                self.time_spent * self.concept_links
            ) / (self.knowledge_gaps * self.research_questions)

            # Max possible efficiency: close all gaps to 1, close all questions to 1
            self.max_efficiency = (
                self.time_spent * self.concept_links
            ) / (1 * 1)

        else:
            self.learning_efficiency = None
            self.max_efficiency = None

        super().save(*args, **kwargs)

    @property
    def efficiency_percentage(self):
        """How close the current score is to its own max potential."""
        if self.max_efficiency and self.max_efficiency > 0:
            return round((self.learning_efficiency / self.max_efficiency) * 100, 2)
        return None

    @property
    def efficiency_rating(self):
        """Human readable rating based on efficiency percentage."""
        pct = self.efficiency_percentage
        if pct is None:
            return "N/A"
        elif pct >= 80:
            return "Excellent"
        elif pct >= 60:
            return "Good"
        elif pct >= 40:
            return "Average"
        else:
            return "Needs Work"

    def __str__(self):
        return f"{self.title} | Score: {self.learning_efficiency} | Max: {self.max_efficiency} | {self.efficiency_rating}"