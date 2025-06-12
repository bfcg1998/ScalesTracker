import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CONDITION_OPTIONS } from "@/lib/constants";

interface AddScaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  isLoading: boolean;
}

export default function AddScaleModal({ isOpen, onClose, onSubmit, isLoading }: AddScaleModalProps) {
  const [formData, setFormData] = useState({
    scaleId: "",
    serialNumber: "",
    model: "",
    manufacturer: "",
    capacity: "",
    location: "",
    nextCalibrationDate: "",
    condition: "excellent",
    notes: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      nextCalibrationDate: formData.nextCalibrationDate ? new Date(formData.nextCalibrationDate) : null,
    });
  };

  const handleClose = () => {
    setFormData({
      scaleId: "",
      serialNumber: "",
      model: "",
      manufacturer: "",
      capacity: "",
      location: "",
      nextCalibrationDate: "",
      condition: "excellent",
      notes: "",
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-charcoal">Add New Scale</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="scaleId">Scale ID *</Label>
            <Input
              id="scaleId"
              placeholder="S-1030"
              value={formData.scaleId}
              onChange={(e) => setFormData(prev => ({ ...prev, scaleId: e.target.value }))}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="model">Model *</Label>
            <Input
              id="model"
              placeholder="Ohaus Precision 5000g"
              value={formData.model}
              onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
              required
            />
          </div>

          <div>
            <Label htmlFor="manufacturer">Manufacturer *</Label>
            <Input
              id="manufacturer"
              placeholder="Ohaus"
              value={formData.manufacturer}
              onChange={(e) => setFormData(prev => ({ ...prev, manufacturer: e.target.value }))}
              required
            />
          </div>

          <div>
            <Label htmlFor="capacity">Capacity *</Label>
            <Input
              id="capacity"
              placeholder="5000g"
              value={formData.capacity}
              onChange={(e) => setFormData(prev => ({ ...prev, capacity: e.target.value }))}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="serialNumber">Serial Number *</Label>
            <Input
              id="serialNumber"
              placeholder="45782902"
              value={formData.serialNumber}
              onChange={(e) => setFormData(prev => ({ ...prev, serialNumber: e.target.value }))}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="nextCalibrationDate">Next Calibration Date</Label>
            <Input
              id="nextCalibrationDate"
              type="date"
              value={formData.nextCalibrationDate}
              onChange={(e) => setFormData(prev => ({ ...prev, nextCalibrationDate: e.target.value }))}
            />
          </div>

          <div>
            <Label htmlFor="condition">Condition</Label>
            <Select value={formData.condition} onValueChange={(value) => setFormData(prev => ({ ...prev, condition: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(CONDITION_OPTIONS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              placeholder="Storage room A"
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
            />
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Additional notes..."
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            />
          </div>
          
          <div className="flex space-x-4 pt-4">
            <Button 
              type="button" 
              variant="outline"
              onClick={handleClose}
              className="flex-1"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="flex-1 military-blue"
              disabled={isLoading}
            >
              {isLoading ? "Adding..." : "Add Scale"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
