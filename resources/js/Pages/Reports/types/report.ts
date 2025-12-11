export interface Report {
    id: string;
    report_name: string;
    total_tasks: number;
    completed_tasks: number;
    total_story_points: number;
    created_at: string;
}

export interface ReportData {
    [projectName: string]: ReportTask[];
}

export interface ReportTask {
    no: number | null;
    priority: string;
    fitur: string;
    title: string;
    description: string;
    step: string;
    acceptance_criteria: string;
    definition_of_done: string;
    status: string;
    target_selesai: string;
    start_date: string;
    end_date: string;
    developer: string;
    story_point: number;
    delivery_tepat_waktu: string;
    temuan_bug: string;
}

export interface ReportShowData {
    id: string;
    report_name: string;
    total_tasks: number;
    completed_tasks: number;
    total_story_points: number;
    report_data: ReportData;
    created_at: string;
}
