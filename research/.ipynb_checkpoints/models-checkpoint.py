from django.db import models
from django.utils import timezone


class ResearchPillar(models.Model):
    """Top level research domains in your PhD"""

    PILLAR_CHOICES = [
        ("AI_FORENSICS", "AI Forensics"),
        ("CYBER_SECURITY", "Cyber Security"),
        ("LEGAL_FRAMEWORK", "Legal & Forensic Framework"),
        ("ML_ADVERSARIAL", "Adversarial Machine Learning"),
        ("ATTRIBUTION", "AI Attack Attribution"),
        ("TOOLS_METHODS", "Tools & Methodology"),
    ]

    name = models.CharField(max_length=100, choices=PILLAR_CHOICES, unique=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.get_name_display()


class LearningRecord(models.Model):
    """A single study session"""

    SESSION_TYPES = [
        ("PAPER", "Reading a Paper"),
        ("CODING", "Coding / Lab Work"),
        ("WRITING", "Writing / Documentation"),
        ("SEMINAR", "Seminar / Lecture"),
        ("REVIEW", "Review / Revision"),
        ("EXPERIMENT", "Experiment / Research"),
    ]

    OUTPUT_TYPES = [
        ("NOTES", "Notes"),
        ("DRAFT", "Draft Paragraph"),
        ("CODE", "Code / Script"),
        ("HYPOTHESIS", "Hypothesis"),
        ("DIAGRAM", "Diagram / Model"),
        ("NONE", "No Output"),
    ]

    # Core identity
    title = models.CharField(max_length=255)
    pillar = models.ForeignKey(
        ResearchPillar,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="sessions",
    )
    session_type = models.CharField(
        max_length=20, choices=SESSION_TYPES, default="PAPER"
    )

    # Efficiency variables
    time_spent = models.FloatField()           # Ts
    concept_links = models.FloatField()        # Cl
    knowledge_gaps = models.FloatField()       # Kg
    research_questions = models.FloatField()   # Rq

    # Computed fields
    learning_efficiency = models.FloatField(blank=True, null=True)
    max_efficiency = models.FloatField(blank=True, null=True)

    # Session output
    output_type = models.CharField(
        max_length=20, choices=OUTPUT_TYPES, default="NONE"
    )
    output_notes = models.TextField(blank=True)

    # Recurring gap tracking
    recurring_gap = models.BooleanField(default=False)
    gap_description = models.TextField(blank=True)

    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if self.knowledge_gaps > 0 and self.research_questions > 0:
            # Current efficiency
            self.learning_efficiency = (
                self.time_spent * self.concept_links
            ) / (self.knowledge_gaps * self.research_questions)

            # Max possible efficiency (Kg=1, Rq=1)
            self.max_efficiency = self.time_spent * self.concept_links

        else:
            self.learning_efficiency = None
            self.max_efficiency = None

        super().save(*args, **kwargs)

    @property
    def efficiency_percentage(self):
        """How close current score is to max potential."""
        if self.max_efficiency and self.max_efficiency > 0:
            return round((self.learning_efficiency / self.max_efficiency) * 100, 2)
        return None

    @property
    def efficiency_rating(self):
        """Human readable rating."""
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

    @property
    def produced_output(self):
        """Did this session produce something tangible?"""
        return self.output_type != "NONE"

    def __str__(self):
        return (
            f"[{self.session_type}] {self.title} | "
            f"Score: {self.learning_efficiency:.2f} | "
            f"{self.efficiency_rating}"
        )

    class Meta:
        ordering = ["-created_at"]


class KnowledgeGapTracker(models.Model):
    """Tracks recurring knowledge gaps across sessions"""

    STATUS_CHOICES = [
        ("OPEN", "Open"),
        ("IN_PROGRESS", "In Progress"),
        ("RESOLVED", "Resolved"),
    ]

    gap = models.CharField(max_length=255)
    pillar = models.ForeignKey(
        ResearchPillar,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="gaps",
    )
    sessions = models.ManyToManyField(
        LearningRecord,
        blank=True,
        related_name="tracked_gaps",
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="OPEN")
    resolution_notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    resolved_at = models.DateTimeField(null=True, blank=True)

    def resolve(self, notes=""):
        self.status = "RESOLVED"
        self.resolution_notes = notes
        self.resolved_at = timezone.now()
        self.save()

    def __str__(self):
        return f"[{self.status}] {self.gap}"

    class Meta:
        ordering = ["status", "-created_at"]