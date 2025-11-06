import {Dialog, DialogContent, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {Calendar, DollarSign, MapPin} from "lucide-react";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Button} from "@/components/ui/button";

export function CZalendarDialog() {
    return (
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogContent className="sm:max-w-md bg-fff">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5"/>
                        Criar Evento - {selectedDay}/{month + 1}/{year}
                    </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <div>
                        <Label htmlFor="eventName">Nome do Evento</Label>
                        <Input
                            id="eventName"
                            value={eventForm.name}
                            onChange={(e) => setEventForm({...eventForm, name: e.target.value})}
                            placeholder="Digite o nome do evento"
                        />
                    </div>

                    <div>
                        <Label htmlFor="eventType">Tipo do Evento</Label>
                        <Select value={eventForm.type}
                                onValueChange={(value) => setEventForm({...eventForm, type: value})}>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione o tipo"/>
                            </SelectTrigger>
                            <SelectContent className="bg-fff">
                                {EVENT_TYPES.map((type) => (
                                    <SelectItem key={type} value={type}>
                                        {type}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label htmlFor="eventLocation">Local (opcional)</Label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground"/>
                            <Input
                                id="eventLocation"
                                value={eventForm.location}
                                onChange={(e) => setEventForm({...eventForm, location: e.target.value})}
                                placeholder="Digite o local do evento"
                                className="pl-10"
                            />
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="eventCost">Gasto (R$)</Label>
                        <div className="relative">
                            <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground"/>
                            <Input
                                id="eventCost"
                                type="number"
                                step="0.01"
                                value={eventForm.cost}
                                onChange={(e) => setEventForm({...eventForm, cost: e.target.value})}
                                placeholder="0,00"
                                className="pl-10"
                            />
                        </div>
                    </div>

                    <div className="flex gap-2 pt-4">
                        <Button variant="outline" onClick={() => setIsModalOpen(false)} className="flex-1">
                            Cancelar
                        </Button>
                        <Button onClick={handleSaveEvent} className="flex-1"
                                disabled={!eventForm.name || !eventForm.type}>
                            Salvar Evento
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}