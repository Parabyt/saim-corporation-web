import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

type Metric = {
  value: string;
  label: string;
};

type CsrPillar = {
  title: string;
  text: string;
};

type Milestone = {
  year: string;
  text: string;
};

@Component({
  selector: 'app-about-page',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './about-page.component.html',
  styleUrl: './about-page.component.scss'
})
export class AboutPageComponent {
  readonly metrics: Metric[] = [
    { value: '40+', label: 'Export Destinations' },
    { value: '300+', label: 'B2B Clients' },
    { value: '12+', label: 'Years in Trade' },
    { value: '70K+', label: 'Units Monthly Capacity' }
  ];

  readonly csrPillars: CsrPillar[] = [
    {
      title: 'Safe Workplaces',
      text: 'We operate controlled production floors with strict safety, ventilation, and ergonomic practices.'
    },
    {
      title: 'Product Reliability',
      text: 'Every shipment follows quality checks for construction, fit, durability, and finishing consistency.'
    },
    {
      title: 'Employee Well-Being',
      text: 'Skill growth, fair systems, and wellness practices are central to our production culture.'
    },
    {
      title: 'Environmental Focus',
      text: 'We continue reducing waste, improving material efficiency, and adopting more responsible processes.'
    },
    {
      title: 'Ethical Sourcing',
      text: 'Supplier partnerships are screened for compliance, traceability, and labor responsibility.'
    },
    {
      title: 'Community Collaboration',
      text: 'We support local manufacturing talent and engage in initiatives that strengthen our industry ecosystem.'
    }
  ];

  readonly milestones: Milestone[] = [
    { year: '2014', text: 'Saim Corporation started with a focused leather and sportswear export unit.' },
    { year: '2016', text: 'Expanded into private-label production for European and Middle Eastern buyers.' },
    { year: '2018', text: 'Introduced dedicated quality and compliance checkpoints across all process lines.' },
    { year: '2020', text: 'Scaled operations with integrated procurement, sampling, and logistics coordination.' },
    { year: '2023', text: 'Strengthened global network with repeat B2B programs in multiple destination markets.' },
    { year: '2026', text: 'Advancing digital-first client workflows and admin-ready customization capabilities.' }
  ];
}
