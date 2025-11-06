import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {DollarSign} from "lucide-react";

export function MonthResume() {
    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                    <DollarSign className="h-5 w-5"/>
                    Resumo do Mês
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div
                    className="text-2xl font-bold text-green-600">R$ {getCurrentMonthTotal().toFixed(2)}</div>
                <p className="text-sm text-muted-foreground">Total movimentado em {MONTHS[month]}</p>
            </CardContent>
        </Card>
    )
}