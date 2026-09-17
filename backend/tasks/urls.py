from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    TaskViewSet, SubmissionViewSet, DashboardStatsView, MissionAnalystView, 
    TaskMatchRecommendView, TalentSearchRAGView, AIPredictiveTaskView, 
    AITaskBreakdownView, AIVoiceTaskParserView, WorkloadPeakOptimizerView,
    AdvancedAIMatchEngineView, AutomatedSLAWorkflowView, EnterpriseROIAnalyticsView,
    TestEmailView
)

router = DefaultRouter()
router.register(r'tasks', TaskViewSet, basename='task')
router.register(r'submissions', SubmissionViewSet, basename='submission')

urlpatterns = [
    path('', include(router.urls)),
    path('dashboard/stats/', DashboardStatsView.as_view(), name='dashboard-stats'),
    path('mission-intelligence/analyst/', MissionAnalystView.as_view(), name='mission-analyst'),
    path('matching/recommend/', TaskMatchRecommendView.as_view(), name='task-match-recommend'),
    path('talent-search/', TalentSearchRAGView.as_view(), name='talent-search-rag'),
    path('predict-completion/', AIPredictiveTaskView.as_view(), name='ai-predict-completion'),
    path('ai-breakdown/', AITaskBreakdownView.as_view(), name='ai-task-breakdown'),
    path('parse-voice/', AIVoiceTaskParserView.as_view(), name='ai-parse-voice'),
    path('workload-optimizer/', WorkloadPeakOptimizerView.as_view(), name='ai-workload-optimizer'),
    path('ai-match-engine/', AdvancedAIMatchEngineView.as_view(), name='ai-match-engine'),
    path('sla-workflows/', AutomatedSLAWorkflowView.as_view(), name='sla-workflows'),
    path('enterprise-roi/', EnterpriseROIAnalyticsView.as_view(), name='enterprise-roi'),
    path('test-email/', TestEmailView.as_view(), name='test-email'),
]



