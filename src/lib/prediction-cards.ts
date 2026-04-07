// ==============================================================================
// PREDICTION CARDS — Shareable image generation (Spotify Wrapped style)
// ==============================================================================

import { useRef, useCallback } from 'react';

interface PredictionCardData {
  score: number;
  destination: string;
  scenario: string;
  timeHorizon: number;
  metrics: {
    happiness: number;
    financial: number;
    social: number;
    career: number;
  };
  userName?: string;
}

const DESTINATION_FLAGS: Record<string, string> = {
  portugal: '🇵🇹',
  dubai: '🇦🇪',
  thailand: '🇹🇭',
  singapore: '🇸🇬',
  spain: '🇪🇸',
  mexico: '🇲🇽',
  france: '🇫🇷',
  germany: '🇩🇪',
  uk: '🇬🇧',
  usa: '🇺🇸',
  canada: '🇨🇦',
  japan: '🇯🇵',
};

const getScoreGradient = (score: number): string => {
  if (score >= 70) return 'linear-gradient(135deg, #10B981 0%, #059669 100%)';
  if (score >= 50) return 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)';
  return 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)';
};

const getScoreLabel = (score: number): string => {
  if (score >= 70) return 'EXCELLENT';
  if (score >= 50) return 'BON';
  if (score >= 30) return 'MODÉRÉ';
  return 'RISQUÉ';
};

export function usePredictionCard() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const generateCard = useCallback(async (data: PredictionCardData): Promise<string> => {
    const canvas = canvasRef.current;
    if (!canvas) return '';

    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    // Card dimensions (Instagram optimized 1080x1350)
    const width = 1080;
    const height = 1350;
    canvas.width = width;
    canvas.height = height;

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#0F172A');
    gradient.addColorStop(0.5, '#1E293B');
    gradient.addColorStop(1, '#0F172A');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Decorative circles
    ctx.globalAlpha = 0.1;
    ctx.fillStyle = '#8B5CF6';
    ctx.beginPath();
    ctx.arc(200, 150, 300, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#06B6D4';
    ctx.beginPath();
    ctx.arc(900, 1100, 250, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    // Logo/Brand
    ctx.fillStyle = '#8B5CF6';
    ctx.font = 'bold 48px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('ODYSSEY', width / 2, 100);
    ctx.fillStyle = '#94A3B8';
    ctx.font = '24px system-ui';
    ctx.fillText('Life Prediction System', width / 2, 140);

    // Main score circle
    const scoreGradient = getScoreGradient(data.score);
    const scoreGradientCtx = ctx.createRadialGradient(width / 2, 450, 50, width / 2, 450, 200);
    scoreGradientCtx.addColorStop(0, scoreGradient.split(' ')[2] || '#10B981');
    scoreGradientCtx.addColorStop(1, scoreGradient.split(' ')[5] || '#059669');
    
    ctx.fillStyle = scoreGradientCtx;
    ctx.beginPath();
    ctx.arc(width / 2, 450, 180, 0, Math.PI * 2);
    ctx.fill();

    // Score text
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 140px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(`${data.score}`, width / 2, 490);
    ctx.font = '36px system-ui';
    ctx.fillText('/100', width / 2, 540);

    // Score label
    const label = getScoreLabel(data.score);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 28px system-ui';
    ctx.fillText(label, width / 2, 590);

    // Destination
    const flag = DESTINATION_FLAGS[data.destination.toLowerCase()] || '🌍';
    ctx.font = 'bold 72px system-ui';
    ctx.fillText(`${flag} ${data.destination.toUpperCase()}`, width / 2, 720);

    // Scenario & timeframe
    ctx.fillStyle = '#94A3B8';
    ctx.font = '32px system-ui';
    ctx.fillText(`${data.scenario} • ${data.timeHorizon} mois`, width / 2, 770);

    // Metrics bar
    const metricsY = 880;
    const barWidth = 800;
    const barHeight = 60;
    const startX = (width - barWidth) / 2;

    const metrics = [
      { label: 'Bonheur', value: data.metrics.happiness, color: '#F59E0B' },
      { label: 'Finance', value: data.metrics.financial, color: '#10B981' },
      { label: 'Social', value: data.metrics.social, color: '#8B5CF6' },
      { label: 'Carrière', value: data.metrics.career, color: '#06B6D4' },
    ];

    ctx.font = 'bold 24px system-ui';
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'left';
    ctx.fillText('MÉTRIQUES', startX, metricsY);

    let currentX = startX;
    const gap = 20;
    const totalBars = metrics.length;
    const barWidthCalc = (barWidth - (totalBars - 1) * gap) / totalBars;

    metrics.forEach((m) => {
      // Label
      ctx.fillStyle = '#94A3B8';
      ctx.font = '20px system-ui';
      ctx.fillText(m.label, currentX, metricsY + 30);
      
      // Bar background
      ctx.fillStyle = '#334155';
      ctx.fillRect(currentX, metricsY + 45, barWidthCalc, 20);
      
      // Bar fill
      ctx.fillStyle = m.color;
      ctx.fillRect(currentX, metricsY + 45, (barWidthCalc * m.value) / 100, 20);
      
      // Value
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 20px system-ui';
      ctx.fillText(`${m.value}`, currentX + barWidthCalc / 2, metricsY + 90);

      currentX += barWidthCalc + gap;
    });

    // Hashtag
    ctx.textAlign = 'center';
    ctx.fillStyle = '#8B5CF6';
    ctx.font = 'bold 28px system-ui';
    ctx.fillText('#OdysseyAI #Prédiction #Future', width / 2, 1200);

    // User name (optional)
    if (data.userName) {
      ctx.fillStyle = '#94A3B8';
      ctx.font = '24px system-ui';
      ctx.fillText(`Par ${data.userName}`, width / 2, 1250);
    }

    // Date
    ctx.fillStyle = '#64748B';
    ctx.font = '20px system-ui';
    ctx.fillText(new Date().toLocaleDateString('fr-FR', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    }), width / 2, 1280);

    // Return as blob URL
    return canvas.toDataURL('image/png', 1.0);
  }, []);

  const downloadCard = useCallback(async (data: PredictionCardData): Promise<void> => {
    const dataUrl = await generateCard(data);
    if (!dataUrl) return;

    const link = document.createElement('a');
    link.download = `prediction-odyssey-${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
  }, [generateCard]);

  const shareCard = useCallback(async (data: PredictionCardData): Promise<boolean> => {
    const dataUrl = await generateCard(data);
    if (!dataUrl) return false;

    try {
      // Convert to blob for sharing
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      const file = new File([blob], 'prediction.png', { type: 'image/png' });

      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: 'Ma Prédiction Odyssey',
          text: `🎯 Mon score: ${data.score}/100 - Destination: ${data.destination}`,
          files: [file],
        });
        return true;
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(
          `🎯 Ma prédiction Odyssey: ${data.score}/100 (${getScoreLabel(data.score)})\n🌍 ${data.destination}\n📅 ${data.timeHorizon} mois\n\nTeste aussi: odyssey-ai.app`
        );
        alert('Image copiée dans le presse-papiers!');
        return true;
      }
    } catch (e) {
      console.error('Share failed:', e);
      return false;
    }
  }, [generateCard]);

  return { canvasRef, generateCard, downloadCard, shareCard };
}

// Mini card for social media (smaller format)
export function generateMiniCard(data: PredictionCardData): string {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // 1200x630 (OpenGraph)
  canvas.width = 1200;
  canvas.height = 630;

  // Background
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, '#0F172A');
  gradient.addColorStop(1, '#1E293B');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Score
  ctx.fillStyle = data.score >= 70 ? '#10B981' : data.score >= 50 ? '#F59E0B' : '#EF4444';
  ctx.font = 'bold 180px system-ui';
  ctx.textAlign = 'center';
  ctx.fillText(`${data.score}`, canvas.width / 2, 280);
  ctx.font = '40px system-ui';
  ctx.fillText('/100', canvas.width / 2, 340);

  // Destination
  const flag = DESTINATION_FLAGS[data.destination.toLowerCase()] || '🌍';
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 48px system-ui';
  ctx.fillText(`${flag} ${data.destination.toUpperCase()}`, canvas.width / 2, 420);

  // Label
  ctx.fillStyle = '#94A3B8';
  ctx.font = '28px system-ui';
  ctx.fillText(getScoreLabel(data.score), canvas.width / 2, 470);

  // Branding
  ctx.fillStyle = '#8B5CF6';
  ctx.font = 'bold 32px system-ui';
  ctx.fillText('ODYSSEY.AI', canvas.width / 2, 560);

  return canvas.toDataURL('image/png', 1.0);
}