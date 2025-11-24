import { useState } from "react";
import { Visualizer } from "@/components/Visualizer";
import { ControlPanel } from "@/components/ControlPanel";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAudioAnalyzer } from "@/hooks/useAudioAnalyzer";

export type VisualMode = "particles" | "waveform" | "kaleidoscope" | "glitch" | "bloom";

export interface VisualizerSettings {
  colorIntensity: number;
  complexity: number;
  speed: number;
  blurAmount: number;
  glitchEffect: number;
  bassReactivity: number;
  trebleReactivity: number;
  rhythmSensitivity: number;
  distortion: number;
}

const Index = () => {
  const [visualMode, setVisualMode] = useState<VisualMode>("particles");
  const [settings, setSettings] = useState<VisualizerSettings>({
    colorIntensity: 100,
    complexity: 50,
    speed: 50,
    blurAmount: 0,
    glitchEffect: 0,
    bassReactivity: 80,
    trebleReactivity: 60,
    rhythmSensitivity: 70,
    distortion: 0,
  });

  const {
    handleFileUpload,
    togglePlayPause,
    getFrequencyData,
    isPlaying,
    currentFile,
    hasAudio,
  } = useAudioAnalyzer();

  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      {/* Visualizer Canvas */}
      <Visualizer mode={visualMode} settings={settings} getFrequencyData={getFrequencyData} />

      {/* Mobile Controls Toggle */}
      <div className="fixed top-4 right-4 z-50 lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="bg-card/80 backdrop-blur-lg border-primary/20">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[350px] bg-card/95 backdrop-blur-xl border-primary/20">
            <ControlPanel
              visualMode={visualMode}
              setVisualMode={setVisualMode}
              settings={settings}
              setSettings={setSettings}
              onFileUpload={handleFileUpload}
              isPlaying={isPlaying}
              onTogglePlayPause={togglePlayPause}
              currentFile={currentFile}
              hasAudio={hasAudio}
            />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Control Panel */}
      <div className="hidden lg:block fixed top-0 right-0 h-full w-[400px] bg-card/80 backdrop-blur-xl border-l border-primary/20 z-40 overflow-y-auto">
        <ControlPanel
          visualMode={visualMode}
          setVisualMode={setVisualMode}
          settings={settings}
          setSettings={setSettings}
          onFileUpload={handleFileUpload}
          isPlaying={isPlaying}
          onTogglePlayPause={togglePlayPause}
          currentFile={currentFile}
          hasAudio={hasAudio}
        />
      </div>
    </div>
  );
};

export default Index;
