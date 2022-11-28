import * as user_management_component from '../user-management.component';
// @ponicode
describe('user_management_component.UserManagementComponent.newStudent', () => {
  let inst: any;

  beforeEach(() => {
    inst = new user_management_component.UserManagementComponent();
  });

  test('0', () => {
    let result: any = inst.newStudent();
    expect(result).toMatchSnapshot();
  });
});
