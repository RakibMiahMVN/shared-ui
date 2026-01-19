import { ICommonUser } from "../components/tracking-timeline/types";

export class CommonUserModel {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  gravatar?: string | null;
  shipping_mark?: string | null;
  type?: string | null;

  constructor(data: ICommonUser) {
    this.id = data.id;
    this.name = data.name;
    this.email = data.email;
    this.phone = data.phone;
    this.gravatar = data.gravatar;
    this.shipping_mark = data.shipping_mark;
    this.type = data.type;
  }

  getId = () => this.id;
  getName = () => this.name;
  getEmail = () => this.email;
  getPhone = () => this.phone;
  getGravatar = () => this.gravatar;
  getShippingMark = () => this.shipping_mark;
  getType = () => this.type;
}
