from django.test import TestCase
from skills import models as skill_models
from .. import utils as test_utils
from allauth.account.models import EmailAddress
from wallet import models as wallet_models
from users import models
from unittest import mock
import json
import cloudinary


class BaseMutationTestCase(TestCase):
    def graphql_query(self, query, **kwargs):
        return self.client.post(test_utils.url_string(),
                                test_utils.j(query=query, **kwargs),
                                "application/json")

    def assert_response(self, response, callback):
        # import pdb; pdb.set_trace()
        data = response.json().get("data")
        error = response.json().get('errors')
        if error:
            # pass
            import pdb
            pdb.set_trace()
        if not data:
            # pass
            import pdb
            pdb.set_trace()
        callback(data)

    def make_mutation_call(self, mutation, mutationName, callback):
        response = self.graphql_query(query=mutation)

        def assert_callback(json_data):
            data = json_data[mutationName]
            callback(data)

        self.assert_response(response, assert_callback)


class AccountantMutationTestCase(BaseMutationTestCase):
    def setUp(self):
        self.user = models.User.objects.create(
            first_name="Danny", last_name="Devito", email='danny@example.com')
        self.wallet = wallet_models.Wallet.objects.create(
            owner=self.user, amount_available=20000)
        self.payout = wallet_models.UserPayout.objects.create(
            user=self.user,
            bank="Guaranty Trust Bank",
            payout_type=wallet_models.UserPayout.BANK_TRANSFER,
            account_name="James NOVAK",
            account_id="1233452320",
            recipient_code="23232jiwoiwow")
        self.wallet.initiate_withdrawal(
            payout=self.payout, amount=20000, charge=1000, force=False)
        self.withdrawal_detail = wallet_models.RequestToWithdraw.objects.first(
        )

    def create_query(self, order, action, mutation="account_delete_actions"):
        options = {
            'account_delete_actions':
            lambda: 'account_delete_actions(order:"%s",action:"%s",test:false)' % (order, action),
            "make_tutor_payment":
            lambda: 'make_tutor_payment(order:"%s",test:%s)' % (order, action),
            'account_test_delete_actions':
            lambda: 'account_delete_actions(order:"%s",action:"%s",test:true)' % (order, action),
        }
        response = {
            'account_delete_actions': 'status',
            'make_tutor_payment': 'status',
            "account_test_delete_actions": 'status'
        }
        mutations = options[mutation]
        mutation_fields = response[mutation]
        return """ 
            mutation{ 
            %s{
                %s
            }
        } """ % (mutations(), mutation_fields)

    def test_make_tutor_payment(self):
        query = self.create_query(self.withdrawal_detail.order, "false",
                                  'make_tutor_payment')
        self.assertEqual(wallet_models.WalletTransaction.objects.count(), 1)

        def callback(data):
            self.assertTrue(data['status'])
            self.assertEqual(wallet_models.WalletTransaction.objects.count(),
                             3)
            self.assertEqual(wallet_models.RequestToWithdraw.objects.count(),
                             0)

        self.make_mutation_call(query, 'make_tutor_payment', callback)

    def test_make_test_tutor_payment(self):
        query = self.create_query(self.withdrawal_detail.order, "true",
                                  'make_tutor_payment')
        self.assertEqual(wallet_models.WalletTransaction.objects.count(), 1)

        def callback(data):
            self.assertTrue(data['status'])
            self.assertEqual(wallet_models.WalletTransaction.objects.count(),
                             1)
            self.assertEqual(wallet_models.RequestToWithdraw.objects.count(),
                             1)

        self.make_mutation_call(query, 'make_tutor_payment', callback)

    def test_delete_withdrawal(self):
        query = self.create_query(self.withdrawal_detail.order,
                                  'delete_withdrawal')
        self.assertEqual(wallet_models.WalletTransaction.objects.count(), 1)

        def callback(data):
            self.assertTrue(data['status'])
            self.assertEqual(wallet_models.WalletTransaction.objects.count(),
                             0)
            self.assertEqual(wallet_models.RequestToWithdraw.objects.count(),
                             0)

        self.make_mutation_call(query, 'account_delete_actions', callback)

    def test_test_delete_withdrawal(self):
        query = self.create_query(self.withdrawal_detail.order,
                                  'delete_withdrawal',
                                  "account_test_delete_actions")
        self.assertEqual(wallet_models.WalletTransaction.objects.count(), 1)

        def callback(data):
            self.assertTrue(data['status'])
            self.assertEqual(wallet_models.WalletTransaction.objects.count(),
                             1)
            self.assertEqual(wallet_models.RequestToWithdraw.objects.count(),
                             1)

        self.make_mutation_call(query, 'account_delete_actions', callback)

    def test_delete_transaction(self):
        first_transaction = wallet_models.WalletTransaction.objects.first()
        query = self.create_query(first_transaction.pk, 'delete_transaction')
        self.assertEqual(wallet_models.WalletTransaction.objects.count(), 1)

        def callback(data):
            self.assertTrue(data['status'])
            self.assertEqual(wallet_models.WalletTransaction.objects.count(),
                             0)

        self.make_mutation_call(query, 'account_delete_actions', callback)

    def test_test_delete_transaction(self):
        first_transaction = wallet_models.WalletTransaction.objects.first()
        query = self.create_query(first_transaction.pk, 'delete_transaction',
                                  "account_test_delete_actions")
        self.assertEqual(wallet_models.WalletTransaction.objects.count(), 1)

        def callback(data):
            self.assertTrue(data['status'])
            self.assertEqual(wallet_models.WalletTransaction.objects.count(),
                             1)

        self.make_mutation_call(query, 'account_delete_actions', callback)


class TutorAdminMutationTestCase(BaseMutationTestCase):
    def setUp(self):
        self.user = models.User.objects.create(
            first_name="Danny", last_name="Devito", email='danny@example.com')
        models.PhoneNumber.objects.create(
            owner=self.user, number="+2347035209922", verified=True)
        models.Location.objects.create(
            user=self.user,
            address="20 Irabor Street",
            state="Lagos",
            vicinity="Ikeja")
        profile = self.user.profile
        profile_data = {
            'image': cloudinary.CloudinaryImage("etvlmy1siobm1xc8phkt"),
            "application_status": models.UserProfile.PENDING
        }
        for key, value in profile_data.items():
            setattr(profile, key, value)
        profile.save()
        models.UserIdentification.objects.create(
            user=self.user,
            identity=cloudinary.CloudinaryImage("etvlmy1siobm1xc8phkt"))
        self.user.emailaddress_set.create(user=self.user, verified=False)

    def create_skill(self,
                     status=skill_models.TutorSkill.PENDING,
                     profile_status=models.UserProfile.VERIFIED):
        sk1 = skill_models.Skill.objects.create(name="English Language")
        models.UserProfile.objects.filter(user_id=self.user.pk).update(
            application_status=profile_status)
        skill = skill_models.TutorSkill.objects.create(
            skill=sk1, price=5000, tutor=self.user, status=status)
        skill_models.QuizSitting.objects.create(
            tutor_skill=skill,
            score=80,
            completed=False,
            started=True,
        )
        return skill

    @mock.patch('registration.tasks.email_to_verified_tutor.delay')
    def test_approve_tutor(self, mock_mail):
        query = self.create_query(True, "approve_tutor")
        self.assertEqual(self.user.profile.application_status,
                         models.UserProfile.PENDING)

        def callback(data):
            self.assertEqual(data['user']['slug'], self.user.slug)
            profile = models.UserProfile.objects.get(user_id=self.user.pk)
            self.assertEqual(profile.application_status,
                             models.UserProfile.VERIFIED)
            mock_mail.assert_called_once_with(
                self.user.profile.pk, status=True)

        self.make_mutation_call(query, "approve_tutor", callback)

    @mock.patch('registration.tasks.email_to_verified_tutor.delay')
    def test_test_approve_tutor(self, mock_mail):
        query = self.create_query(True, "test_approve_tutor")
        self.assertEqual(self.user.profile.application_status,
                         models.UserProfile.PENDING)

        def callback(data):
            self.assertEqual(data['user']['slug'], self.user.slug)
            profile = models.UserProfile.objects.get(user_id=self.user.pk)
            self.assertEqual(profile.application_status,
                             models.UserProfile.PENDING)
            self.assertFalse(mock_mail.called)

        self.make_mutation_call(query, "approve_tutor", callback)

    @mock.patch('registration.tasks.email_to_verified_tutor.delay')
    def test_deny_tutor(self, mock_mail):
        query = self.create_query(False, "approve_tutor")
        self.assertEqual(self.user.profile.application_status,
                         models.UserProfile.PENDING)

        def callback(data):
            self.assertEqual(data['user']['slug'], self.user.slug)
            profile = models.UserProfile.objects.get(user_id=self.user.pk)
            self.assertEqual(profile.application_status,
                             models.UserProfile.DENIED)
            mock_mail.assert_called_once_with(
                self.user.profile.pk, status=False)

        self.make_mutation_call(query, "approve_tutor", callback)

    @mock.patch('registration.tasks.email_to_verified_tutor.delay')
    def test_test_deny_tutor(self, mock_mail):
        query = self.create_query(False, "test_approve_tutor")
        self.assertEqual(self.user.profile.application_status,
                         models.UserProfile.PENDING)

        def callback(data):
            self.assertEqual(data['user']['slug'], self.user.slug)
            profile = models.UserProfile.objects.get(user_id=self.user.pk)
            self.assertEqual(profile.application_status,
                             models.UserProfile.PENDING)

        self.make_mutation_call(query, "approve_tutor", callback)

    def create_query(self, action, mutation="admin_actions"):
        options = {
        'admin_actions': lambda: 'admin_actions(email:"%s",action:"%s")' % (self.user.email, action),
        "approve_tutor": lambda: 'approve_tutor(email:"%s", verified:%s)' %(self.user.email, json.dumps(action)),
        'test_admin_actions': lambda: 'admin_actions(email:"%s",action:"%s",test:true)' % (self.user.email, action),
        "test_approve_tutor": lambda: 'approve_tutor(email:"%s", verified:%s,test:true)' %(self.user.email, json.dumps(action)),
        "skill_admin_actions": lambda: 'skill_admin_actions(pk:%s, action: "%s")' % (action['pk'],action['action'])

        }
        response = {
            'admin_actions': 'status',
            'approve_tutor': 'user{slug}',
            'test_admin_actions': 'status',
            'test_approve_tutor': 'user{slug}',
            'skill_admin_actions': 'skill{pk}'
        }
        mutations = options[mutation]
        mutation_fields = response[mutation]
        return """ 
            mutation{ 
            %s{
                %s
            }
        } """ % (mutations(), mutation_fields)

    def test_approve_email_manually(self):
        query = self.create_query('approve_email')
        self.assertFalse(self.user.email_verified)

        def callback(data):
            self.assertTrue(data['status'])
            self.assertTrue(self.user.email_verified_func())

        self.make_mutation_call(query, "admin_actions", callback)

    def test_test_approve_email_manually(self):
        query = self.create_query('approve_email', 'test_admin_actions')
        self.assertFalse(self.user.email_verified)

        def callback(data):
            self.assertTrue(data['status'])
            self.assertFalse(self.user.email_verified_func())

        self.make_mutation_call(query, "admin_actions", callback)

    @mock.patch('users.tasks')
    def test_notify_tutor_about_email(self, mock_email):
        query = self.create_query("notify_about_email")

        def callback(data):
            self.assertTrue(data['status'])
            mock_email.verify_email_notification.assert_called_once_with(
                [self.user.pk])

        self.make_mutation_call(query, "admin_actions", callback)

    @mock.patch('users.tasks')
    def test_test_notify_tutor_about_email(self, mock_email):
        query = self.create_query("notify_about_email", 'test_admin_actions')

        def callback(data):
            self.assertTrue(data['status'])
            self.assertFalse(mock_email.verify_email_notification.called)

        self.make_mutation_call(query, "admin_actions", callback)

    @mock.patch('cloudinary.api')
    @mock.patch("users.tasks.re_upload_profile_pic")
    def test_reject_tutor_profile_pic(self, mock_re_upload, mock_cloudinary):
        profile = self.user.profile
        query = self.create_query("reject_profile_pic")

        def callback(data):
            self.assertTrue(data['status'])
            mock_cloudinary.delete_resources.assert_called_once_with(
                [profile.image.public_id])
            mock_re_upload.assert_called_once_with(self.user.pk)

        self.make_mutation_call(query, 'admin_actions', callback)

    @mock.patch('cloudinary.api')
    @mock.patch("users.tasks.re_upload_profile_pic")
    def test_test_reject_tutor_profile_pic(self, mock_re_upload,
                                           mock_cloudinary):
        profile = self.user.profile
        query = self.create_query("reject_profile_pic", 'test_admin_actions')

        def callback(data):
            self.assertTrue(data['status'])
            self.assertFalse(mock_cloudinary.delete_resources.called)
            self.assertFalse(mock_re_upload.called)

        self.make_mutation_call(query, 'admin_actions', callback)

    @mock.patch('cloudinary.api')
    def test_approve_tutor_identification(self, mock_cloudinary):
        query = self.create_query("approve_identification")
        self.assertFalse(self.user.id_verified)

        def callback(data):
            self.assertTrue(data['status'])
            self.assertTrue(self.user.id_verified_func())

        self.make_mutation_call(query, 'admin_actions', callback)

    @mock.patch('cloudinary.api')
    def test_test_approve_tutor_identification(self, mock_cloudinary):
        query = self.create_query("approve_identification",
                                  'test_admin_actions')
        self.assertFalse(self.user.id_verified)

        def callback(data):
            self.assertTrue(data['status'])
            self.assertFalse(self.user.id_verified_func())

        self.make_mutation_call(query, 'admin_actions', callback)

    def test_reject_tutor_identification(self):
        query = self.create_query('reject_identification')
        self.assertIsNotNone(self.user.identity)

        def callback(data):
            self.assertTrue(data['status'])
            self.assertFalse(self.user.id_verified_func())

        self.make_mutation_call(query, 'admin_actions', callback)

    def test_test_reject_tutor_identification(self):
        query = self.create_query('reject_identification',
                                  'test_admin_actions')
        self.assertIsNotNone(self.user.identity)

        def callback(data):
            self.assertTrue(data['status'])
            self.assertIsNotNone(self.user.identity)

        self.make_mutation_call(query, 'admin_actions', callback)

    @mock.patch('registration.tasks.verify_id_to_new_tutors')
    def test_email_tutor_to_upload_profile_pic(self, mock_mail):
        query = self.create_query('upload_profile_pic_email')

        def callback(data):
            self.assertTrue(data['status'])
            mock_mail.assert_called_once_with(self.user.pk, False)

        self.make_mutation_call(query, 'admin_actions', callback)

    @mock.patch('registration.tasks.verify_id_to_new_tutors')
    def test_test_email_tutor_to_upload_profile_pic(self, mock_mail):
        query = self.create_query('upload_profile_pic_email',
                                  'test_admin_actions')

        def callback(data):
            self.assertTrue(data['status'])
            self.assertFalse(mock_mail.called)

        self.make_mutation_call(query, 'admin_actions', callback)

    @mock.patch("registration.tasks.verify_id_to_new_tutors")
    def test_email_tutor_to_upload_verification(self, mock_mail):
        query = self.create_query('upload_verification_email')

        def callback(data):
            self.assertTrue(data['status'])
            mock_mail.assert_called_once_with(self.user.pk)

        self.make_mutation_call(query, 'admin_actions', callback)

    @mock.patch("registration.tasks.tasks1.email_and_sms_helper")
    def test_email_to_update_curriculum(self, mock_mail):
        query = self.create_query('curriculum_update')

        def callback(data):
            self.assertTrue(data['status'])
            mock_mail.assert_called_once_with(
                {
                    'to':
                    self.user.email,
                    'context': {
                        'user': {
                            'first_name': self.user.first_name
                        }
                    },
                    'template':
                    'update_curriculum_email',
                    'title':
                    "Please update the information on your curriculum column",
                },
                backend="mailgun_backend")

        self.make_mutation_call(query, 'admin_actions', callback)

    @mock.patch("registration.tasks.verify_id_to_new_tutors")
    def test_test_email_tutor_to_upload_verification(self, mock_mail):
        query = self.create_query('upload_verification_email',
                                  'test_admin_actions')

        def callback(data):
            self.assertTrue(data['status'])
            self.assertFalse(mock_mail.called)

        self.make_mutation_call(query, 'admin_actions', callback)

    @mock.patch("skills.tasks.email_on_decision_taken_on_subject")
    def test_skill_active_approval(self, mock_mail):
        skill = self.create_skill(skill_models.TutorSkill.PENDING)
        self.assertEqual(skill.status, skill_models.TutorSkill.PENDING)
        query = self.create_query(
            {
                'action': 'approve_skill',
                'pk': skill.pk
            },
            mutation="skill_admin_actions")

        def callback(data):
            self.assertTrue(data['skill'])
            mock_mail.assert_called_once_with(skill.pk, approved=True)
            new_skill = skill_models.TutorSkill.objects.filter(
                pk=skill.pk).first()
            self.assertEqual(new_skill.status, skill_models.TutorSkill.ACTIVE)

        self.make_mutation_call(query, 'skill_admin_actions', callback)

    @mock.patch('skills.tasks.email_to_modify_skill')
    def test_skill_modification(self, mock_mail):
        skill = self.create_skill(skill_models.TutorSkill.PENDING)
        query = self.create_query(
            {
                'action': 'require_modification_skill',
                'pk': skill.pk
            },
            mutation="skill_admin_actions")

        def callback(data):
            self.assertTrue(data['skill'])
            mock_mail.assert_called_once_with(skill.pk)
            new_skill = skill_models.TutorSkill.objects.filter(
                pk=skill.pk).first()
            self.assertEqual(new_skill.status,
                             skill_models.TutorSkill.MODIFICATION)

        self.make_mutation_call(query, 'skill_admin_actions', callback)

    @mock.patch('skills.tasks.email_on_decision_taken_on_subject')
    def test_skill_denied(self, mock_mail):
        skill = self.create_skill(skill_models.TutorSkill.PENDING)
        query = self.create_query(
            {
                'action': 'deny_skill',
                'pk': skill.pk
            },
            mutation="skill_admin_actions")

        def callback(data):
            self.assertTrue(data['skill'])
            mock_mail.assert_called_once_with(skill.pk)
            new_skill = skill_models.TutorSkill.objects.filter(
                pk=skill.pk).first()
            self.assertEqual(new_skill.status, skill_models.TutorSkill.DENIED)

        self.make_mutation_call(query, 'skill_admin_actions', callback)

    @mock.patch('skills.tasks.tasks1.send_mail_helper')
    def test_retake_quiz(self, mock_mail):
        skill = self.create_skill(skill_models.TutorSkill.DENIED)
        self.assertIsNotNone(skill.sitting.first())
        query = self.create_query(
            {
                'action': 'retake_test',
                'pk': skill.pk
            },
            mutation="skill_admin_actions")

        def callback(data):
            self.assertIsNone(data['skill'])
            self.assertTrue(mock_mail.called)
            # mock_mail.assert_called_once_with(skill.tutor_id)
            self.assertEqual(self.user.tutorskill_set.count(), 0)

        self.make_mutation_call(query, 'skill_admin_actions', callback)

    def test_freeze_profile(self):
        query = self.create_query('freeze_profile')

        def callback(data):
            self.assertTrue(data['status'])
            self.assertTrue(self.user.profile.application_status,
                            models.UserProfile.FROZEN)

        self.make_mutation_call(query, 'admin_actions', callback)

    def test_unfreeze_profile(self):
        self.create_skill(profile_status=models.UserProfile.FROZEN)
        profile = models.UserProfile.objects.get(user_id=self.user.pk)
        self.assertEqual(profile.application_status, models.UserProfile.FROZEN)
        query = self.create_query('unfreeze_profile')

        def callback(data):
            self.assertTrue(data['status'])
            profile = models.UserProfile.objects.get(user_id=self.user.pk)
            self.assertTrue(profile.application_status,
                            models.UserProfile.VERIFIED)

        self.make_mutation_call(query, 'admin_actions', callback)

    @mock.patch('cloudinary.api')
    def test_delete_exhibitions(self, mock_cloudinary):
        skill = self.create_skill()
        skill_models.SubjectExhibition.objects.create(
            ts=skill, image=cloudinary.CloudinaryImage('images'))
        self.assertTrue(skill.exhibitions.exists())
        query = self.create_query(
            {
                'action': 'delete_exhibitions',
                'pk': skill.pk
            },
            mutation="skill_admin_actions")

        def callback(data):
            self.assertTrue(data['skill'])
            self.assertFalse(skill.exhibitions.exists())

        self.make_mutation_call(query, 'skill_admin_actions', callback)
