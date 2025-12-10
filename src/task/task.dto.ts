export class TaskDto {
  id: string;
  title: string;
  description: string;
  status: string;
  expirationDate: Date;
}

export class FindALLParameters {
  title: string;
  status: string;
}
