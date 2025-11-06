import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {ChevronLeft, ChevronRight} from "lucide-react";

export function Calendar() {
    return (
        <Card>
            <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                    <Button variant="outline" size="icon" onClick={goToPreviousMonth}
                            className="h-8 w-8 bg-transparent">
                        <ChevronLeft className="h-4 w-4"/>
                    </Button>
                    <CardTitle className="text-xl font-semibold">
                        {MONTHS[month]} {year}
                    </CardTitle>

                    <Button variant="outline" size="icon" onClick={goToNextMonth}
                            className="h-8 w-8 bg-transparent">
                        <ChevronRight className="h-4 w-4"/>
                    </Button>
                </div>
            </CardHeader>

            <CardContent>
                {/* Cabeçalho dos dias da semana */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                    {DAYS_OF_WEEK.map((day) => (
                        <div
                            key={day}
                            className="h-8 flex items-center justify-center text-sm font-medium text-muted-foreground"
                        >
                            {day}
                        </div>
                    ))}
                </div>

                {/* Grade do calendário */}
                <div className="grid grid-cols-7 gap-1">{generateCalendarDays()}</div>

                <div className="mt-4 pt-4 border-t border-border">
                    <div className="space-y-3">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                                <div className="h-3 w-3 bg-primary rounded"></div>
                                <span>Hoje</span>
                            </div>
                        </div>

                        {getCurrentMonthEventTypes().length > 0 && (
                            <div>
                                <div className="text-sm font-medium mb-2">Tipos de Eventos:</div>
                                <div className="grid grid-cols-2 gap-2">
                                    {getCurrentMonthEventTypes().map((type) => (
                                        <div key={type} className="flex items-center gap-2 text-xs">
                                            <div
                                                className={`h-3 w-3 rounded ${EVENT_TYPE_COLORS[type]}`}></div>
                                            <span>{type}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}