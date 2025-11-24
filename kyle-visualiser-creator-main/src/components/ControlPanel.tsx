import { VisualMode, VisualizerSettings } from "@/pages/Index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Music, Upload, Play, Pause } from "lucide-react";
import { useRef } from "react";
import { toast } from "sonner";

interface ControlPanelProps {
  visualMode: VisualMode;
  setVisualMode: (mode: VisualMode) => void;
  settings: VisualizerSettings;
  setSettings: (settings: VisualizerSettings) => void;
  onFileUpload: (file: File) => void;
  isPlaying: boolean;
  onTogglePlayPause: () => void;
  currentFile: string;
  hasAudio: boolean;
}

export const ControlPanel = ({
  visualMode,
  setVisualMode,
  settings,
  setSettings,
  onFileUpload,
  isPlaying,
  onTogglePlayPause,
  currentFile,
  hasAudio,
}: ControlPanelProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith("audio/")) {
        onFileUpload(file);
        toast.success(`Loaded: ${file.name}`);
      } else {
        toast.error("Please select an audio file");
      }
    }
  };

  const updateSetting = (key: keyof VisualizerSettings, value: number) => {
    setSettings({ ...settings, [key]: value });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Music className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Audio Visualizer
          </h1>
        </div>
        <p className="text-sm text-muted-foreground">
          {currentFile ? `Playing: ${currentFile}` : "Upload an audio file to begin 🎵"}
        </p>
      </div>

      {/* Audio Upload */}
      <div className="space-y-2">
        <Label htmlFor="audio-upload" className="text-foreground">Upload Audio File</Label>
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*"
          onChange={handleFileChange}
          className="hidden"
          id="audio-upload"
        />
        <div className="flex gap-2">
          <Button
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 bg-gradient-to-r from-primary to-secondary hover:opacity-90"
          >
            <Upload className="h-4 w-4 mr-2" />
            Choose File
          </Button>
          {hasAudio && (
            <Button
              onClick={onTogglePlayPause}
              variant="outline"
              size="icon"
              className="border-primary/20"
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
          )}
        </div>
      </div>

      {/* Visual Mode */}
      <div className="space-y-2">
        <Label className="text-foreground">Visual Mode</Label>
        <Select value={visualMode} onValueChange={(value) => setVisualMode(value as VisualMode)}>
          <SelectTrigger className="bg-muted border-primary/20">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="particles">Particles</SelectItem>
            <SelectItem value="waveform">Waveform</SelectItem>
            <SelectItem value="kaleidoscope">Kaleidoscope</SelectItem>
            <SelectItem value="glitch">Glitch</SelectItem>
            <SelectItem value="bloom">Bloom</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Settings Controls */}
      <div className="space-y-4">
        <ControlSlider
          label="Color Intensity"
          value={settings.colorIntensity}
          onChange={(value) => updateSetting("colorIntensity", value)}
        />
        <ControlSlider
          label="Complexity"
          value={settings.complexity}
          onChange={(value) => updateSetting("complexity", value)}
        />
        <ControlSlider
          label="Speed"
          value={settings.speed}
          onChange={(value) => updateSetting("speed", value)}
        />
        <ControlSlider
          label="Blur Amount"
          value={settings.blurAmount}
          onChange={(value) => updateSetting("blurAmount", value)}
        />
        <ControlSlider
          label="Glitch Effect"
          value={settings.glitchEffect}
          onChange={(value) => updateSetting("glitchEffect", value)}
        />
        <ControlSlider
          label="Bass Reactivity"
          value={settings.bassReactivity}
          onChange={(value) => updateSetting("bassReactivity", value)}
        />
        <ControlSlider
          label="Treble Reactivity"
          value={settings.trebleReactivity}
          onChange={(value) => updateSetting("trebleReactivity", value)}
        />
        <ControlSlider
          label="Rhythm Sensitivity"
          value={settings.rhythmSensitivity}
          onChange={(value) => updateSetting("rhythmSensitivity", value)}
        />
        <ControlSlider
          label="Distortion"
          value={settings.distortion}
          onChange={(value) => updateSetting("distortion", value)}
        />
      </div>
    </div>
  );
};

interface ControlSliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
}

const ControlSlider = ({ label, value, onChange }: ControlSliderProps) => {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <Label className="text-sm text-foreground">{label}</Label>
        <span className="text-sm font-mono text-primary">{value}</span>
      </div>
      <Slider
        value={[value]}
        onValueChange={([newValue]) => onChange(newValue)}
        max={100}
        step={1}
        className="cursor-pointer"
      />
    </div>
  );
};
