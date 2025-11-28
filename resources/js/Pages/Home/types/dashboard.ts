export interface DashboardCardProps {
    title: string;
    description: string;
    icon: React.ReactNode;
    href?: string;
    isComingSoon?: boolean;
}

export interface QuickActionCardProps extends DashboardCardProps {
    href: string;
}

export interface WelcomeMessageProps {
    title: string;
    description: string;
    ctaText: string;
    ctaHref: string;
}
